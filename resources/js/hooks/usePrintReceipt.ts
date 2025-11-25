import axios from 'axios';
import * as JSPM from 'jsprintmanager';
import { useEffect, useState } from 'react';

interface PrintReceiptProps {
    isDonePayment: boolean;
    setIsDonePayment: (value: boolean) => void;
}

export const usePrintReceipt = ({ isDonePayment, setIsDonePayment }: PrintReceiptProps) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!JSPM.JSPrintManager) return setError('JSPrintManager client library not loaded');
        JSPM.JSPrintManager.auto_reconnect = true;
        try {
            JSPM.JSPrintManager.start();
        } catch (err) {
            setError('Failed to start JSPrintManager client: ' + JSON.stringify(err));
        }
    }, []);

    useEffect(() => {
        if (!isDonePayment) return;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axios.get(route('receipts.billing'), { responseType: 'blob' });
                await printPDF(data);
            } catch (err) {
                setError('Failed to fetch/print PDF: ' + JSON.stringify(err));
            } finally {
                setLoading(false);
                setIsDonePayment(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDonePayment]);

    const printPDF = async (pdfBlob: Blob) => {
        if (!JSPM.JSPrintManager) throw new Error('JSPrintManager not loaded');
        for (let i = 0; JSPM.JSPrintManager.websocket_status !== JSPM.WSStatus.Open && i < 20; i++) await new Promise((r) => setTimeout(r, 500));
        if (JSPM.JSPrintManager.websocket_status !== JSPM.WSStatus.Open)
            throw new Error('JSPM Client not connected. Make sure service is running on localhost:5000');

        const printersObj = await JSPM.JSPrintManager.getPrinters();
        const printers = Array.isArray(printersObj) ? printersObj : Object.values(printersObj || {});
        const printerName = printers.find((p: string) => p.includes('TM-U220'));
        if (!printerName) throw new Error('TM-U220 printer not found');

        const cpj = new JSPM.ClientPrintJob();
        cpj.clientPrinter = new JSPM.InstalledPrinter(printerName);

        const reader = new FileReader();
        reader.onload = () => {
            const blob = new Blob([reader.result as ArrayBuffer], { type: 'application/pdf' });
            const pdfFile = new JSPM.PrintFilePDF(blob, JSPM.FileSourceType.BLOB, 'receipt.pdf', 1);
            cpj.files.push(pdfFile);
            cpj.sendToClient();
        };
        reader.readAsArrayBuffer(pdfBlob);
    };

    return { error, loading };
};
