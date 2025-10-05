// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const exportToCSV = () => {
    const rows = Array.from(document.querySelectorAll('table tr'));
    
    if (rows.length <= 1) {
        alert('No data to export');
        return;
    }
    
    const csv = rows.map(row => 
        Array.from(row.querySelectorAll('td, th'))
            .map(cell => {
                const text = cell.textContent.trim();
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                return `"${text.replace(/"/g, '""')}"`;
            })
            .join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `ses-events-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('CSV export completed');
};