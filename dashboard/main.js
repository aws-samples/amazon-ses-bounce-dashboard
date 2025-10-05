// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const tableEL = document.querySelector("table");
const tableBody = tableEL.querySelector("tbody");
const reloadBtn = document.getElementById('reload-btn');
const exportBtn = document.getElementById('export-btn');

const loadAllData = async () => {
    if (!SES_URL) {
        alert('SES_URL not configured in parameters.js');
        return;
    }

    reloadBtn.disabled = true;
    reloadBtn.textContent = 'Loading...';
    
    try {
        const response = await fetch(SES_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const items = data.items || data; // Support both old and new format
        
        tableBody.innerHTML = "";
        
        const currentDateTime = new Date();
        document.getElementById("_lastCall").innerHTML = 
            `Updated on: ${currentDateTime.toLocaleDateString()} at ${currentDateTime.toLocaleTimeString()}`;
        
        items.forEach(msg => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = msg.timestamp || '';
            row.insertCell().textContent = msg.type || '';
            row.insertCell().textContent = msg.from || '';
            row.insertCell().textContent = msg.recipient || '';
            row.insertCell().textContent = msg.Error || '';
            row.insertCell().textContent = msg.id || '';
        });
        
        console.log(`Loaded ${items.length} events`);
        
    } catch (err) {
        console.error('Failed to load data:', err);
        alert(`Failed to load data: ${err.message}`);
        document.getElementById("_lastCall").innerHTML = 
            `<span style="color: red;">Error loading data. Check console for details.</span>`;
    } finally {
        reloadBtn.disabled = false;
        reloadBtn.textContent = 'Reload Data';
    }
};

loadAllData();

reloadBtn.addEventListener('click', () => {
    loadAllData();
});

exportBtn.addEventListener('click', () => {
    exportToCSV();
});
