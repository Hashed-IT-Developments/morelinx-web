import { Application } from '../types/application-report-types';
import type { CsfTicket } from '../types/csf-summary-report-types';
import { IsnapPayment } from '../types/isnap-payment-types';
import { Inspection } from '../types/monitoring-types';

export function downloadCSV(data: Inspection[], filename: string) {
    if (!data || data.length === 0) {
        console.warn('No data to download');
        return;
    }

    // Define CSV headers
    const headers = ['Customer', 'Status', 'Customer Type', 'Address', 'Schedule Date', 'Inspector'];

    // Convert data to CSV rows
    const rows = data.map((item) => [
        item.customer || '',
        item.status || '',
        item.customer_type || '',
        item.address || '',
        item.schedule_date || '',
        item.inspector || '',
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row
                .map((cell) => {
                    // Escape quotes and wrap in quotes if contains comma, newline, or quote
                    const cellStr = String(cell);
                    if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                })
                .join(','),
        ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function downloadExcel(data: Inspection[] | Application[] | IsnapPayment[] | CsfTicket[], filename: string) {
    if (!data || data.length === 0) {
        console.warn('No data to download');
        return;
    }

    let headers: string[];
    let tableRows: string;

    if ('customer' in data[0]) {
        // Inspection type
        const inspectionData = data as Inspection[];
        headers = ['Customer', 'Status', 'Customer Type', 'Address', 'Schedule Date', 'Inspector'];
        tableRows = inspectionData
            .map(
                (item) => `
            <tr>
                <td>${item.customer || ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.customer_type || ''}</td>
                <td>${item.address || ''}</td>
                <td>${item.schedule_date || ''}</td>
                <td>${item.inspector || ''}</td>
            </tr>
        `,
            )
            .join('');
    } else if ('paid_amount' in data[0]) {
        // IsnapPayment type
        const paymentData = data as IsnapPayment[];
        headers = ['Account Number', 'Customer Name', 'Rate Class', 'Town', 'Barangay', 'Paid Amount', 'Date Paid'];
        tableRows = paymentData
            .map(
                (item) => `
            <tr>
                <td>${item.account_number || ''}</td>
                <td>${item.customer_name || ''}</td>
                <td>${item.rate_class || ''}</td>
                <td>${item.town || ''}</td>
                <td>${item.barangay || ''}</td>
                <td>${item.paid_amount || ''}</td>
                <td>${item.date_paid || ''}</td>
            </tr>
        `,
            )
            .join('');
    } else if ('ticket_no' in data[0]) {
        // CSF tickets
        const csfData = data as CsfTicket[];
        headers = [
            'Ticket No',
            'Account Number',
            'Customer Name',
            'Ticket Type',
            'Concern Type',
            'Status',
            'Town',
            'Barangay',
            'User',
            'Ticket Created',
        ];
        tableRows = csfData
            .map(
                (item) => `
            <tr>
                <td>${item.ticket_no || ''}</td>
                <td>${item.account_number || ''}</td>
                <td>${item.customer_name || ''}</td>
                <td>${item.ticket_type || ''}</td>
                <td>${item.concern_type || ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.town || ''}</td>
                <td>${item.barangay || ''}</td>
                <td>${item.user || ''}</td>
                <td>${item.created_at || ''}</td>
            </tr>
        `,
            )
            .join('');
    } else {
        // Application type
        const applicationData = data as Application[];
        headers = ['ID', 'Account Number', 'Customer Name', 'Rate Class', 'Status', 'Town', 'Barangay', 'Load (kW)', 'Date Applied'];
        tableRows = applicationData
            .map(
                (item) => `
            <tr>
                <td>${item.id || ''}</td>
                <td>${item.account_number || ''}</td>
                <td>${item.customer_name || ''}</td>
                <td>${item.rate_class || ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.town || ''}</td>
                <td>${item.barangay || ''}</td>
                <td>${item.load || ''}</td>
                <td>${item.date_applied || ''}</td>
            </tr>
        `,
            )
            .join('');
    }

    const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Sheet1</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table { border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f2f2f2; font-weight: bold; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        ${headers.map((h) => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
