import { LightningElement } from 'lwc';
import quaggaLib from '@salesforce/resourceUrl/QuaggaJS'; // Import the QuaggaJS static resource
import { loadScript } from 'lightning/platformResourceLoader';

export default class BarcodeScanner extends LightningElement {
    videoStream;
    barcodeResult = null;
    quaggaLoaded = false;

    connectedCallback() {
        // Load the QuaggaJS library when the component is connected
        loadScript(this, quaggaLib)
            .then(() => {
                console.log('QuaggaJS loaded');
                this.quaggaLoaded = true;
            })
            .catch(error => {
                console.error('Error loading QuaggaJS', error);
            });
    }

    startScanner() {
        if (this.quaggaLoaded) {
            this.initCamera();
        } else {
            console.error('QuaggaJS not loaded yet');
        }
    }

    initCamera() {
        // Request access to the camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                this.videoStream = stream;
                const videoElement = this.template.querySelector('video');
                videoElement.srcObject = stream;
                
                // Initialize Quagga to start barcode scanning
                this.initQuagga(videoElement);
            })
            .catch((error) => {
                console.error('Error accessing the camera: ', error);
            });
    }

    initQuagga(videoElement) {
        // QuaggaJS configuration to scan barcodes
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: videoElement, // Pass the video element for scanning
                constraints: {
                    facingMode: "environment" // Use the back camera (if available)
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader"] // Supported barcode types
            }
        }, (err) => {
            if (err) {
                console.error('Error initializing Quagga:', err);
                return;
            }
            Quagga.start();
        });

        // Register a listener for when a barcode is detected
        Quagga.onDetected((data) => {
            if (data && data.codeResult && data.codeResult.code) {
                this.barcodeResult = data.codeResult.code; // Get the decoded barcode value
                Quagga.stop(); // Stop scanning after detection (optional)
            }
        });
    }

    disconnectedCallback() {
        // Stop the video stream and Quagga when the component is destroyed
        if (this.videoStream) {
            const tracks = this.videoStream.getTracks();
            tracks.forEach(track => track.stop());
        }
        Quagga.stop();
    }
}
