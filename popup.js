// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
let securityToken;
let domainUrl;


let loader = document.getElementById('isLoading');
let picklist = document.getElementById('objPickList');
let downloadButton = document.getElementById('download');

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
                        securityToken = cookie.value;
                        getAllObjes();
                        loader.innerHTML = "Fetching all objects please wait";
                         downloadButton.classList.remove("slds-hide");
                        picklist.classList.remove("slds-hide");
                    }
                    else{
                        loader.innerHTML = "Not a Salesforce Page";    
                        downloadButton.classList.add("slds-hide");
                        picklist.classList.add("slds-hide");
                    }
                });
            }
        }
    );

});





downloadButton.onclick = function(element) {
    if (picklist.selectedIndex) {
        let urlOfObject = picklist.options[picklist.selectedIndex].value;
        getAllFields(urlOfObject);
    }
}


function getAllObjes() {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + securityToken, 'Content-Type': 'application/json' };
    fetch(domainUrl + '/services/data/v42.0/sobjects', { method: 'GET', headers: headers }).then(json).then(data => {
        let allObj = data.sobjects;
        loader.innerHTML = "";
        console.log(allObj);
        allObj.forEach(function(sObj) {
            let option = document.createElement("option");
            option.text = sObj.name;
            option.setAttribute("value", sObj.urls.describe);
            picklist.add(option);
        });


    });
}

function getAllFields(uri) {
    let json = (response) => { return response.json() }
    let headers = { 'Authorization': 'Bearer ' + securityToken, 'Content-Type': 'application/json' };
    fetch(domainUrl + uri, { method: 'GET', headers: headers }).then(json).then(data => {
        console.log(data);
        let txtData = createMembresString(data.name, data.fields);
        console.log(txtData);
        download(data.name + '_fields', txtData);
    });
}

function createMembresString(objName, listofFields) {
    let startString = '<types><members>*</members>'+ '\n';
    let middileString = '';
    listofFields.forEach(function(fData) {
        middileString += '<members>' + objName + '.' + fData.name + '<members>' + '\n';
    });
    let endString = '<name>CustomField</name></types>';
    return startString + middileString + endString;
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
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