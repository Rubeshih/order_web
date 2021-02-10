#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask
from flask import render_template
from flask import request

import json
import os
import requests
import threading

app = Flask(__name__)

@app.route("/index", methods=['GET', 'POST'])
def index():

    if request.method == 'POST':
        xml = preprocess(request.data.decode('utf-8'))
        print(xml)
        #postToCsharp(xml.encode('utf-8'))
        threading.Thread(target = postToCsharp, args =[xml.encode('utf-8')]).start()
        return render_template('index.html')
    
    elif request.method == 'GET':
        return render_template('index.html')

@app.route("/localFile/single", methods=['GET'])
def localFile_single():
    fname = "./static/單點.txt"
    fp = open(fname, "r")
    return fp.read(os.stat(fname).st_size)

@app.route("/localFile/set", methods=['GET'])
def localFile_set():
    fname = "./static/套餐.txt"
    fp = open(fname, "r")
    return fp.read(os.stat(fname).st_size)

@app.route('/index/cart', methods=['GET'])
def index_cart():
    return preprocess()

def preprocess(jsonx):
    try:
        js = json.loads(jsonx)
        packet = {}
        phase = []

        for key, value in js.items():

            if key == "TableNumber" :
                packet['TableNumber'] = value

            else:
                phase.append(value)
            

        packet['Meals'] = phase
        return json.dumps(packet, ensure_ascii=False)
    
    except:
        return ""

def postToCsharp(xml):
    r = requests.post('http://127.0.0.1:2222/home', data=xml)

def sendCallBack(excpt):
    print("hello world")

app.run(debug=True, host='0.0.0.0', port = 9191, processes=1)