// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const tableEL = document.querySelector("table")
const tableBody = tableEL.querySelector("tbody");
const reloadBtn = document.getElementById('reload-btn');
const exportBtn = document.getElementById('export-btn');


const loadAllData = () => {
    console.log(SES_URL)
    
    fetch( SES_URL)
        .then(response => response.json())
        .then(responseJson =>  {
            tableBody.innerHTML = "";
            var _currentDateTime = new Date();
            document.getElementById("_lastCall").innerHTML = `Updated on:  ${_currentDateTime.toLocaleDateString()} at ${_currentDateTime.toLocaleTimeString()}`;
            for(let msgs of responseJson) {
        
                console.log(msgs);
                const rowElement = document.createElement("tr");

                //timestamp
                const timestampEl = document.createElement("td");
                timestampEl.textContent = msgs.timestamp
                rowElement.appendChild(timestampEl)

                //type
                const typeEl = document.createElement("td");
                typeEl.textContent = JSON.stringify(msgs.type)
                rowElement.appendChild(typeEl)

                //from
                const fromEl = document.createElement("td");
                fromEl.textContent =JSON.stringify( msgs.from)
                rowElement.appendChild(fromEl)

                //recipient
                const recipientEl = document.createElement("td");
                recipientEl.textContent = JSON.stringify(msgs.recipient)
                rowElement.appendChild(recipientEl)

                //error
                const errortEl = document.createElement("td");
                errortEl.textContent = JSON.stringify(msgs.Error)
                rowElement.appendChild(errortEl)

                //ID
                const idEl = document.createElement("td");
                idEl.textContent = JSON.stringify(msgs.id)
                rowElement.appendChild(idEl)

                tableBody.appendChild(rowElement)

            }
            

        })    
}       
loadAllData();
reloadBtn.addEventListener('click',()=> {
    loadAllData()
})

exportBtn.addEventListener('click',()=>{
    exportToCSV()
})
