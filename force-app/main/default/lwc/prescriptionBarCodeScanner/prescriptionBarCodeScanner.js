import { LightningElement } from 'lwc';
import { getBarcodeScanner } from 'lightning/mobileCapabilities';
import CapricornHealthAssets from '@salesforce/resourceUrl/CapricornHealthAssets';

export default class PrescriptionBarCodeScanner extends LightningElement {
    myScanner = getBarcodeScanner();
    scanButtonDisabled = false;
    scannedBarcode = '';
    
    //detect if scanner module available in mobile publisher 
    isMobilePublisher = (this.myScanner != null && this.myScanner.isAvailable() );

    handleBeginScanClick(event) {

        // Reset scannedBarcode to empty string before starting new scan
        this.scannedBarcode = '';

        this.myScanner.beginCapture({
            barcodeTypes: ["code128", "code39", "code93", "ean13", "ean8", "upca", "upce", "qr", "datamatrix", "itf", "pdf417"],
            instructionText: 'Scan a QR Code',
            successText: 'Scanning complete.'
        }).then((result) => {

            if(result.value && result.value.startsWith('https://capricornhealth.sfdxp.com/medication/'))
            {
                let newLink = document.createElement('a');
                newLink.setAttribute('href',result.value);
                newLink.click();
            }           

        }).catch((error) => {
            console.log(JSON.stringify(error));
        }).finally(() => {
            this.myScanner.endCapture();
        });

    }
}