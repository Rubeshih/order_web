#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask
from flask import render_template
from flask import request

import json
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route("/index", methods=['GET', 'POST'])
def index():

    if request.method == 'POST':
        data = request.data
        dc = data.decode("utf-8")
        print(dc)
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

app.run(debug=True, host='0.0.0.0', port = 9595, processes=1)