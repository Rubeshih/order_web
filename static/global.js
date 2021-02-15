class MessagePacket{
    constructor(){
        this.TableNumber = 1;
        this.Meals = [];
        this.PrintTwice = false; //remove this line after;
    }
}

class Meal{
    constructor(name, price, count, imgPath){
        this.NAME = name
        this.PRICE = price
        this.COUNT = count
        this.ATTRS = {'isModified':false, 'imgPath': imgPath,/*'isFree':false*/};
    }
};

let templateCopySingles = [];
let msgPacket = new MessagePacket();

window.myglobal = { //這種寫法也行

    //無法送出試著改這裡
    urlHome: "http://127.0.0.1:8080/index", 
    urlChangeMenu: "http://127.0.0.1:8080/changeMenu",
    
    SendMenu:
        function(e){

            if(msgPacket.Meals.length == 0){ 
                console.log("Err:[There's no item in cart]");
                return;
            }
            let request = new XMLHttpRequest()

            let shouldbeAsync = true;
            let method = "POST";
            request.open(method, this.urlHome, shouldbeAsync);
            request.setRequestHeader("Conntent-Type", "application/json;charset=UTF-8");
            request.onload = function(){
                let status = request.status;
                let data = request.responseText;
            }

            request.onreadystatechange = function(){
                if(request.readyState == 4){
                    if(request.status == 200)
                    {
                        alert("已送出");
                        console.log(msgPacket);
                        msgPacket.TableNumber = 1; //重置封包
                        msgPacket.Meals = [];
                        document.querySelector("#Send_list").innerHTML = '';
                        document.querySelector("#priceLabel").innerText = "總價 0";
                        document.querySelector("#custom01").value="菜名..";
                        document.querySelector("#custom02").value="價格..";
                        document.querySelector("#tableSelect").selectedIndex = 0;
                        document.querySelector("#countItem").innerText = "";
                    }
                    else{
                        alert("失敗");
                    }
                }
            }
            
            request.send(JSON.stringify(msgPacket), timeout=1.0);            
    }, 

    changeMenuRequest : function(){
        
        let request = new XMLHttpRequest();
        
        request.open("GET", this.urlChangeMenu, true);
        request.setRequestHeader("Conntent-Type", "application/json;charset=UTF-8");

        request.onreadystatechange = function(){
            if(request.readyState == 4){
                if(request.status == 200)
                {
                    let pcStatus = request.responseText;
                    let jsonStatus = JSON.parse(pcStatus);

                    msgPacket = jsonStatus;
                    document.querySelector("#tableSelect").selectedIndex = msgPacket.TableNumber-1;

                    cartOnload();
                }
                else{
                    alert("擷取菜單失敗");
                }
            }
        }

        request.send(null, timeout=1.0);
    }
}

toggleShowHide = function(e){

    let id = parseInt(e.srcElement.id.substring(6));

    let children = document.getElementById("selection_group").children
    
    for(i = 0; i < children.length; i++){
        if(i == id){
            children[i].className = "show"
        } else {
            children[i].className = "hide"
        }
    }
}

addCustomDish = function(e){
    let target = e.target.parentElement.children;

    if(target[0].value == "菜名..") return;
    if(isNaN(parseInt(target[1].value))) target[1].value = 0;

    json = new Meal(target[0].value, parseInt(target[1].value), 1);

    appendToMeals(json);

    cartOnload();
}

addToCart = function(e){

    let json = JSON.parse(e.target.parentElement.parentElement.dataset.jsontype);
    
    appendToMeals(json);
}

SetaddToCart = function(e){
    
    let arr = JSON.parse(e.target.parentElement.parentElement.dataset.jsontype); //Here is array
    
    for(let i_inSetAddToCart = 0; i_inSetAddToCart < arr.length; i_inSetAddToCart++){

        appendToMeals(arr[i_inSetAddToCart]);
    }
}

appendToMeals = function(Meal){
    
    const tar = findMealInMeals(Meal);

    if(tar == null){
        msgPacket.Meals.push(Meal);
    }
    else {
        tar.COUNT += 1;
    }
}

findMealInMeals = function(Meal){
    
    for(let i_infindMeal = 0; i_infindMeal < msgPacket.Meals.length; i_infindMeal++){
        if(msgPacket.Meals[i_infindMeal].NAME == Meal.NAME)
            return msgPacket.Meals[i_infindMeal];
    }

    return null;
}

explicitAddSingle = function(){
    
    let req = new XMLHttpRequest()
    
    req.open("GET", "/localFile/single", true); // AYSNC
    req.onreadystatechange = function(){

        const selector = document.querySelector("#seletor");

        if(req.readyState == 4){
            if(req.status == 200 || req.status ==0)
            {
                let Text = req.responseText.split('\n');
                let tbody = null;
                let isFirst = false;
                let cateCount = 0;

                for(i = 0; i<Text.length; i++){

                    let line = Text[i];
                    if(line.length == 0) continue;
                    
                    if(line.substring(0,2) == "-*")
                    {
                        let catgoryName = line.substring(2);

                        let option = document.createElement("option");
                        option.innerText = catgoryName;
                        selector.appendChild(option); 

                        tbody = document.createElement("tbody");
                        tbody.className = "selector_hide";
                        tbody.id = "tbody" + cateCount;
                        cateCount += 1;

                        if(isFirst == false){
                            tbody.className = "selector_show"
                            isFirst = true;
                        }
                    }
                    else
                    {
                        line = line.split('\ ');
                        
                        let _dish = new Meal(line[0], parseInt(line[1]), 1, line[2]);
                        templateCopySingles.push(_dish);
                        let tr = document.createElement("tr");
                        tr.setAttribute("data-jsontype", JSON.stringify(_dish));

                        let td0 = document.createElement("td");
                        let td1 = document.createElement("td");
                        let td2 = document.createElement("td");
                        let btn = document.createElement("button");
                        
                        let lb0 = document.createElement("label");
                        let lb1 = document.createElement("label");

                        lb0.className = "tdLabel";
                        lb1.className = "tdLabel";

                        td0.appendChild(lb0);
                        td1.appendChild(lb1);
                        
                        lb0.innerText = _dish.NAME;
                        lb1.innerText = _dish.PRICE;

                        td2.appendChild(btn);
                        btn.innerText = "＋"
                        btn.addEventListener("click", addToCart);

                        tr.appendChild(td0);
                        tr.appendChild(td1);
                        tr.appendChild(td2);

                        tbody.appendChild(tr);

                        document.querySelector("#singleTarget").appendChild(tbody); 
                    }
                }
                explicitAddSet();
            }
        }
    }
    req.send(null)
}

explicitAddSet = function () {
    let req = new XMLHttpRequest()
    
    req.open("GET", "/localFile/set", true);
    req.onreadystatechange = function(){
        if(req.readyState == 4){
            if(req.status == 200 || req.status ==0)
            {
                let Text = req.responseText.split('\n');
                let tbody = null;
                let list = []
                let once = false;
                
                for(i = 0; i<Text.length; i++){
                    
                    let line = Text[i];
                    
                    if(line.length == 0) continue;

                    if(line.substring(0,2) == "-*"){
                    
                        if(!once){
                            once = true;
                        }
                        else{
                            tbody.setAttribute("data-jsontype", JSON.stringify(list));
                            list = []
                        }

                        line = line.substring(2).split('\ ');
                        list.push(new Meal(line[0], parseInt(line[1]), 1))

                        tbody = document.createElement("tbody");
                        let td0 = document.createElement("td");
                        let td1 = document.createElement("td");
                        let td2 = document.createElement("td");
                        let btn = document.createElement("button");

                        let lb0 = document.createElement("label");
                        let lb1 = document.createElement("label");

                        lb0.className = "tdLabel";
                        lb1.className = "tdLabel";

                        lb0.innerText = line[0];
                        lb1.innerText = line[1];
                        
                        td0.appendChild(lb0);
                        td1.appendChild(lb1);
                        td2.appendChild(btn);
                        btn.innerText = '＋';
                        btn.addEventListener("click", SetaddToCart);

                        tbody.appendChild(td0);
                        tbody.appendChild(td1);
                        tbody.appendChild(td2);
                        
                        document.querySelector("#setTarget").appendChild(tbody);
                    }
                    else{
                        let imgPath;

                        for(j = 0 ; j < templateCopySingles.length; j++) //找imgPath
                        {
                            if(templateCopySingles[j].NAME == line){
                                imgPath = templateCopySingles[j].ATTRS.imgPath;
                                break;
                            }
                        }

                        list.push(new Meal(line, 0, 1, imgPath));
                    }
                }
                //少一次 要再放進去
                tbody.setAttribute("data-jsontype", JSON.stringify(list));
                list = [];
                templateCopySingles = null;
            }
        }
    }

    req.send(null);
}

cartOnload = function(e){
    
    sumCountItem();
    //const outerkeys = Object.keys(cart); //Get Json Keys
    document.querySelector("#Send_list").innerHTML = ''

    //Maybe can smarter
    for(i = 0; i < msgPacket.Meals.length; i++){
        subtree = document.createElement("tr");
        const innerJson = msgPacket.Meals[i];
        subtree.setAttribute("data-jsontype", JSON.stringify(innerJson));
        
        subtree.appendChild(document.createElement("td")); //品項
        subtree.childNodes[0].innerText = innerJson.NAME;
        
        subtree.appendChild(document.createElement("td")); //價格
        subtree.childNodes[1].innerText = innerJson.PRICE;

        subtree.appendChild(document.createElement("td")); //總數
        subtree.childNodes[2].innerText = innerJson.COUNT;

        subtree.appendChild(document.createElement("td")); //單一增加
        let increment = document.createElement("button");
        increment.innerText = "↑"
        increment.addEventListener("click",
            function(e) {
                
                let target = e.target.parentElement.parentElement;
                let json = JSON.parse(target.dataset.jsontype);
                
                json.COUNT += 1;

                console.log(json);
                
                target.childNodes[2].innerText = json.COUNT;
                target.dataset.jsontype = JSON.stringify(json);
                
                findMealInMeals(json).COUNT += 1;
                //cart[json.NAME] = json;

                let labe = document.querySelector("#priceLabel")
                labe.dataset.price = parseInt(labe.dataset.price) + json.PRICE;
                labe.innerText = "總價 " + labe.dataset.price;
        });
        subtree.children[3].appendChild(increment);

        subtree.appendChild(document.createElement("td")); //單一減少
        let decrement = document.createElement("button");
        decrement.innerText = "↓"
        decrement.addEventListener("click",
            function(e) {
                let target = e.target.parentElement.parentElement;

                let json = JSON.parse(target.dataset.jsontype);
                let tbody = target.parentElement;
                json.COUNT -= 1;

                if(json.COUNT <= 0){
                    tbody.removeChild(target);
                    let index = msgPacket.Meals.indexOf(findMealInMeals(json));
                    msgPacket.Meals.splice(index, 1);
                    console.log(msgPacket.Meals);
                    sumCountItem();
                    //delete cart[json.NAME];
                
                }
                else{
                    target.childNodes[2].innerText = json.COUNT;
                    target.dataset.jsontype = JSON.stringify(json);
                    findMealInMeals(json).COUNT -= 1;
                    //cart[json.NAME] = json;
                }
                
                let labe = document.querySelector("#priceLabel")
                labe.dataset.price = parseInt(labe.dataset.price) - json.PRICE;
                labe.innerText = "總價 " + labe.dataset.price;
                
        });
        subtree.children[4].appendChild(decrement);

        subtree.appendChild(document.createElement("td")); //免費
        let free = document.createElement("button");
        free.innerText = "Free"
        free.addEventListener("click",
            function(e) {
                let target = e.target.parentElement.parentElement;

                let json = JSON.parse(target.dataset.jsontype);
                
                let labe = document.querySelector("#priceLabel")
                labe.dataset.price = parseInt(labe.dataset.price) - (json.PRICE * json.COUNT);
                labe.innerText = "總價 " + labe.dataset.price;
                
                json.PRICE = 0;
                target.children[1].innerText = 0;
                target.dataset.jsontype = JSON.stringify(json);
                json.ATTRS.isModified = true;
                findMealInMeals(json).PRICE = 0;
                //cart[json.NAME] = json;
        });
        subtree.children[5].appendChild(free);

        subtree.appendChild(document.createElement("td")); //刪除
        let remove = document.createElement("button");
        remove.innerText = "X"
        remove.addEventListener("click",
            function(e) {
                let json = JSON.parse(e.target.parentElement.parentElement.dataset.jsontype);
                let tbody = e.target.parentElement.parentElement.parentElement;
                tbody.removeChild(e.target.parentElement.parentElement)
                let index = msgPacket.Meals.indexOf(findMealInMeals(json));
                msgPacket.Meals.splice(index, 1);
                sumCountItem();
                console.log(msgPacket.Meals);
                priceChange(null);
        });
        subtree.children[6].appendChild(remove);

        document.querySelector("#Send_list").appendChild(subtree);
    }
    priceChange(null);
}

priceChange = function(e){
    
    let price = 0;
    let sendlist = document.querySelector("#Send_list").childNodes;

    for(i = 0; i < sendlist.length; i++){
        let json = JSON.parse(sendlist[i].dataset.jsontype);
        price += json['PRICE'] * json['COUNT'];
    }
    
    let labe = document.querySelector("#priceLabel")
    labe.innerText = "總價 " + price;
    labe.dataset.price = price;
}

const TABLE_NUMBER = 17;
generate_Option = function(){

    let ies = document.querySelector("#tableSelect");
    let option;

    for(i = 1; i <= TABLE_NUMBER; i++)
    {
        option = document.createElement("option");
        option.innerText = i;
        ies.appendChild(option);
    }

    option = document.createElement("option");
    option.innerText = "外帶"
    ies.append(option);

    option = document.createElement("option");
    option.innerText = "外送"
    ies.append(option);

    option = document.createElement("option");
    option.innerText = "訂桌"
    ies.append(option);

    ies.selectedIndex = 0;
}

tableSelectChange = function(e){
    msgPacket.TableNumber = e.target.selectedIndex + 1;
    console.log(e.target.selectedIndex);
}

selectChange = function(e){

    let sel = e.target;
    for(i = 0; i < sel.childNodes.length; i++){
        document.querySelector("#tbody" + i).className = "selector_hide";   
    }
    document.querySelector("#tbody" + e.target.selectedIndex).className = "selector_show";
}

sumCountItem = function(){
    document.querySelector("#countItem").innerHTML = msgPacket.Meals.length + " 道菜";
}

explicitAddSingle();
//explicitAddSet();
