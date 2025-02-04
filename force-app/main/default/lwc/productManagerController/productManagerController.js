import { LightningElement, track } from 'lwc';
import addProducts from '@salesforce/apex/ProductManagerController.addProducts';
import { loadScript } from 'lightning/platformResourceLoader';
import JQUERY from '@salesforce/resourceUrl/jQuery';
import QUAGGHAJS from '@salesforce/resourceUrl/QuaggaJS';
//import BOOTSTRAP from '@salesforce/resourceUrl/Bootstrap3'; // If using Bootstrap

export default class ProductManagerController extends LightningElement {
    @track productRows = [
        { id: 1, name: '', quantity: 0, buyingPrice: 0, mrp: 0, sellingPrice: 0, barcode: '' }
    ];
    productCounter = 1;
    isScriptLoaded = false;
    isScannerOpen = false;
    scannedProductId;

    barcodeResult = '';

    renderedCallback() {
        if (this.isScriptLoaded) {
            return;
        }
        this.isScriptLoaded = true;

        Promise.all([
            loadScript(this, JQUERY),
            loadScript(this, QUAGGHAJS)
            // loadScript(this, BOOTSTRAP) // If using Bootstrap
        ])
        .then(() => {
            console.log('jQuery and QuaggaJS loaded');
            // Initialize any libraries if necessary
        })
        .catch(error => {
            console.error('Error loading scripts', error);
        });
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const id = event.target.dataset.id;
        const updatedRows = this.productRows.map(row => {
            if (row.id == id) {
                return { ...row, [field]: event.target.value };
            }
            return row;
        });
        this.productRows = updatedRows;
    }

    addRow() {
        this.productCounter += 1;
        this.productRows = [
            ...this.productRows,
            { id: this.productCounter, name: '', quantity: 0, buyingPrice: 0, mrp: 0, sellingPrice: 0, barcode: '' }
        ];
    }

    deleteRow(event) {
        const id = event.target.dataset.id;
        this.productRows = this.productRows.filter(row => row.id != id);
    }

    handleSubmit() {
        addProducts({ products: this.productRows })
            .then(result => {
                // Handle success
                console.log('Products added successfully:', result);
                this.resetForm();
            })
            .catch(error => {
                // Handle error
                console.error('Error adding products:', error);
            });
    }

    resetForm() {
        this.productRows = [
            { id: 1, name: '', quantity: 0, buyingPrice: 0, mrp: 0, sellingPrice: 0, barcode: '' }
        ];
        this.productCounter = 1;
    }

    openScanner(event) {
        this.scannedProductId = event.target.dataset.id;
        this.isScannerOpen = true;
        // Initialize QuaggaJS for live scanning if needed
        this.initQuagga();
    }

    closeScanner() {
        this.isScannerOpen = false;
        Quagga.stop();
    }

    initQuagga() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: this.template.querySelector('#interactive'), // Modal's interactive div
                constraints: {
                    facingMode: "environment" // Use the back camera
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "codabar_reader"]
            }
        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("QuaggaJS initialized.");
            Quagga.start();
        });

        Quagga.onDetected(this.handleDetected.bind(this));
    }

    handleDetected(result) {
        if (result && result.codeResult && result.codeResult.code) {
            const barcode = result.codeResult.code;
            this.updateBarcodeField(barcode);
            this.closeScanner();
        }
    }

    updateBarcodeField(barcode) {
        const updatedRows = this.productRows.map(row => {
            if (row.id == this.scannedProductId) {
                return { ...row, barcode: barcode };
            }
            return row;
        });
        this.productRows = updatedRows;
        this.barcodeResult = `Scanned Barcode: ${barcode}`;
    }
}
