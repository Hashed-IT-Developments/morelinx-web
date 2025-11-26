import USB from 'escpos-usb';

const devices = USB.findPrinter();
console.log('Detected USB printers:', devices);
