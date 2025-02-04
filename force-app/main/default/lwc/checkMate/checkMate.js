import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveProducts from '@salesforce/apex/Checkmate.saveProducts'; // Updated to use Checkmate class
import { getBarcodeScanner } from 'lightning/mobileCapabilities';

export default class CheckMate extends LightningElement {
    @track productRows = [
        {
            id: 1,
            name: '',
            stockQuantity: 0,
            buyingPrice: 0,
            mrp: 0,
            sellingPrice: 0,
            barcode: ''
        }
    ];

    @track isScanning = false; // State to check if scanning is in progress
    barcodeScanner;
    currentBarcodeProductId = null; // Track the row where barcode needs to be added

    connectedCallback() {
        // Get the barcode scanner instance when the component is initialized
        this.barcodeScanner = getBarcodeScanner();
    }

    addRow() {
        const newId = this.productRows.length + 1;
        this.productRows = [
            ...this.productRows,
            {
                id: newId,
                name: '',
                stockQuantity: 0,
                buyingPrice: 0,
                mrp: 0,
                sellingPrice: 0,
                barcode: ''
            }
        ];
    }

    deleteRow(event) {
        const id = event.currentTarget.dataset.id;
        this.productRows = this.productRows.filter(product => product.id != id);
    }

    handleInputChange(event) {
        const { id, field } = event.target.dataset;
        const value = event.target.value;
        this.productRows = this.productRows.map(product => {
            if (product.id == id) {
                return { ...product, [field]: value };
            }
            return product;
        });
    }

    // Start Barcode Scanning
    scanBarcode(event) {
        this.currentBarcodeProductId = event.currentTarget.dataset.id;

        // Check if the barcode scanner is available
        if (this.barcodeScanner && this.barcodeScanner.isAvailable()) {
            this.isScanning = true;

            // Start scanning
            this.barcodeScanner
                .beginCapture()
                .then(result => {
                    this.updateBarcodeValue(result.value);
                    this.isScanning = false;
                })
                .catch(error => {
                    console.error('Barcode scanning failed: ', error);
                    this.isScanning = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Barcode Error',
                            message: 'Failed to scan barcode. Please try again.',
                            variant: 'error'
                        })
                    );
                })
                .finally(() => {
                    this.barcodeScanner.endCapture();
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Barcode Scanner Unavailable',
                    message: 'Barcode scanning is only supported in the Salesforce mobile app.',
                    variant: 'warning'
                })
            );
        }
    }

    // Update the barcode value for the selected product row
    updateBarcodeValue(barcodeValue) {
        this.productRows = this.productRows.map(product => {
            if (product.id == this.currentBarcodeProductId) {
                return { ...product, barcode: barcodeValue };
            }
            return product;
        });
    }

    submitProducts() {
        saveProducts({ products: this.productRows })
            .then(() => {
                this.productRows = [
                    {
                        id: 1,
                        name: '',
                        stockQuantity: 0,
                        buyingPrice: 0,
                        mrp: 0,
                        sellingPrice: 0,
                        barcode: ''
                    }
                ];
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Products added successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error adding products',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}
