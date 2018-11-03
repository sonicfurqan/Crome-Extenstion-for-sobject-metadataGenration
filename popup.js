// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
let securityToken;
let domainUrl;


let currentOrgName = document.getElementById('currentOrgName');
let loader = document.getElementById('isLoading');
let picklist = document.getElementById('orgnalOBJList');
let picklist2 = document.getElementById('objPickListCurrent');
let headerName=document.getElementById('curorg');
let downloadButton = document.getElementById('download');
let compareAndDownloadButton=document.getElementById('compareAndDownload');
let objPickListLabel=document.getElementById('objPickListLabel');
let orgPickList=document.getElementById('orgPickList');
let currentOrgButton=document.getElementById('tabCurrent__item');
let compareOrgButton=document.getElementById('tabCompare__item');
let currentOrgContent=document.getElementById('tabCurrent'); 
let compareOrgContent=document.getElementById('tabCompare');
let currentOrgAllObjs=[];
let allAvilDomains=[];
let allObjsEle=[];
let allObjsEleComp=[];
let compareOrgAllObjs=[];
chrome.storage.sync.get('color', function(data) {
    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function(tabs) {
            if (tabs[0].url) {
                let hostUrl = tabs[0].url.split('.com');
                let cookieDetails = {
                    url: hostUrl[0] + '.com',
                    name: "sid",
                }
                    chrome.cookies.get(cookieDetails, function(cookie) {
                        if (cookie) {
                            let url = cookie.domain;
                            domainUrl = 'https://' + url;
                            headerName.innerText=domainUrl;
                            securityToken = cookie.value;
                            loader.innerHTML = "Fetching all objects please wait";
                            currentOrgName.innerText=url;
                            getAllObjes();
                            downloadButton.classList.remove("slds-hide");
                            picklist.classList.remove("slds-hide");
                            objPickListLabel.classList.remove("slds-hide");
                        }
                        else{
                            loader.innerHTML = "Not a Salesforce Page";    
                            downloadButton.classList.add("slds-hide");
                            picklist.classList.add("slds-hide");
                            objPickListLabel.classList.add("slds-hide");
                        }

                    });
                chrome.cookies.getAll({}, function(cookie){
                    //.salesforce.com
                    cookie.forEach(function(singleCookie){
                        if(singleCookie.name=='sid' && singleCookie.domain.indexOf('.salesforce.com')>-1){
                            allAvilDomains.push(singleCookie);
                        }
                    });
                    console.log(allAvilDomains);
                        setOrgList();

                });
                

            }
        }
    );

});


downloadButton.onclick = function(element) {
    if (picklist.selectedIndex>-1) {
        let urlOfObject = picklist.options[picklist.selectedIndex].value;
        getAllFields(urlOfObject);
    }
}
compareAndDownloadButton.onclick = function(element){
    if (picklist2.selectedIndex>-1) {
        let urlOfObject = picklist2.options[picklist2.selectedIndex].value;
        console.log(urlOfObject);
        getMainOrgFields(urlOfObject);
        
        
    }
}

currentOrgButton.onclick =function(element){
    currentOrgButton.classList.add("slds-is-active");   
    compareOrgButton.classList.remove("slds-is-active");   
    


    currentOrgContent.classList.add("slds-show");
    currentOrgContent.classList.remove("slds-hide");

    compareOrgContent.classList.add("slds-hide");
    compareOrgContent.classList.remove("slds-show");

orgPickList.onchange=function(element){
     if (orgPickList.selectedIndex>-1) {
        let url=orgPickList.options[orgPickList.selectedIndex].innerText;
        let sid = orgPickList.options[orgPickList.selectedIndex].value;
        console.log(sid)
        console.log(url)
        getAllObjesOfOrg(url,sid);
    }
}
    
}

compareOrgButton.onclick =function(element){
    compareOrgButton.classList.add("slds-is-active");   
    currentOrgButton.classList.remove("slds-is-active");   
    

    compareOrgContent.classList.add("slds-show");
    compareOrgContent.classList.remove("slds-hide");

    currentOrgContent.classList.add("slds-hide");
    currentOrgContent.classList.remove("slds-show");


}

function setOrgList(){
        
    allAvilDomains.forEach(function(cokiName) {
            let option = document.createElement("option");
            option.text = cokiName.domain;
            option.setAttribute("value", cokiName.value);
            orgPickList.add(option);
        });
}


function getAllObjes() {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + securityToken, 'Content-Type': 'application/json' };
    fetch(domainUrl + '/services/data/v42.0/sobjects', { method: 'GET', headers: headers }).then(json).then(data => {
        if(data.sobjects){
            let allObj = data.sobjects;
            currentOrgAllObjs=allObj;
            loader.innerHTML = "";
            allObj.forEach(function(sObj) {
                let option = document.createElement("option");
                option.text = sObj.name;
                option.setAttribute("value", sObj.urls.describe);
                allObjsEle.push(option);
                
                 
            });
            allObjsEle.forEach(function(el){
               picklist.add(el);
                //picklist2.add(el);
            });
            
               
        }
        else{
            loader.innerHTML = "Switch to salesforce classic";    
            downloadButton.classList.add("slds-hide");
            picklist.classList.add("slds-hide");
            objPickListLabel.classList.add("slds-hide");
        }
        

    });
}

let compOrgHost='';
let compOrgSid='';
function getAllObjesOfOrg(url,sid) {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + sid, 'Content-Type': 'application/json' };
    fetch('https://'+url + '/services/data/v42.0/sobjects', { method: 'GET', headers: headers }).then(json).then(data => {
        
        if(data[0]){
            if(data[0].errorCode){
                 loader.innerHTML = "Switch to salesforce classic";    
            }
        }
        if(data.sobjects){
           compOrgHost='https://'+url;
           compOrgSid=sid;
            let allObj = data.sobjects;
            console.log(allObj);
            compareOrgAllObjs=allObj;
            allObj.forEach(function(sObj) {
                let option = document.createElement("option");
                option.text = sObj.name;
                option.setAttribute("value", sObj.urls.describe);
                allObjsEleComp.push(option);
                
                 
            });
            allObjsEleComp.forEach(function(el){
               //picklist.add(el);
                picklist2.add(el);
            });
            
               
        }
        else{
            loader.innerHTML = "Switch to salesforce classic";    
            downloadButton.classList.add("slds-hide");
            picklist.classList.add("slds-hide");
            objPickListLabel.classList.add("slds-hide");
        }
        

    });
}


function getAllFields(uri) {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + securityToken, 'Content-Type': 'application/json' };
    fetch(domainUrl + uri, { method: 'GET', headers: headers }).then(json).then(data => {

        let txtData = createMembresString(data.name, data.fields);
        download(data.name + '_fields', txtData);
    });
}

function getMainOrgFields(uri) {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + securityToken, 'Content-Type': 'application/json' };
    fetch(domainUrl + uri, { method: 'GET', headers: headers }).then(json).then(data => {
        if(data.fields){
            console.log(data.fields);
            getCompOrgFields(uri,data.fields);
        }
        return data;
        //let txtData = createMembresString(data.name, data.fields);
        //download(data.name + '_fields', txtData);
    });
}
function getCompOrgFields(uri,fields) {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + compOrgSid, 'Content-Type': 'application/json' };
    fetch(compOrgHost + uri, { method: 'GET', headers: headers }).then(json).then(data => {
        if(data.fields){
            console.log('main',fields);
            console.log('cmp',data.fields);
            let same=fields.filter(function(element){
                let hasFiled = data.fields.some(obj => obj.name.indexOf(element.name) > -1);
                if(hasFiled){
                    return  element;
                }
            });  
            download(data.name + '_fields',createMembresString(same)) ;


        }
        return data;
        //let txtData = createMembresString(data.name, data.fields);
        //download(data.name + '_fields', txtData);
    });
}

function createMembresString(objName, listofFields) {
    let startString = '<types><members>*</members>'+ '\n';
    let middileString = '';
    listofFields.forEach(function(fData) {
        middileString += '<members>' + objName + '.' + fData.name + '</members>' + '\n';
    });
    let endString = '<name>CustomField</name></types>';
    return startString + middileString + endString;
}

function download(filename, text) {
    var element = document.createElement('a'); 
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
/*
<types>
  <members>*</members>

  <members>Account.MyCustomAccountField__c</members>
  <members>Account.Phone</members>

  <name>CustomField</name>
</types>
*/