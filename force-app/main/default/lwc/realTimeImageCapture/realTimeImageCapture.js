import { LightningElement, track } from 'lwc';
import saveImage from '@salesforce/apex/ImageCaptureController.saveImage';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RealTimeImageCapture extends LightningElement {
    @track imageUrl;
    videoRef;
    cameraStarted = false;
    imageCaptured = false;
    showMobileInput = false;

    get cameraContainerStyle() {
        return `
            display: ${this.cameraStarted ? 'block' : 'none'};
            height: auto;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            position: relative;
            padding-top: 56.25%;
            background-color: #f0f0f0;
        `;
    }

    async startCamera() {
        this.videoRef = this.template.querySelector('video');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoRef.srcObject = stream;
            this.videoRef.play();
            this.cameraStarted = true;
            this.imageCaptured = false;
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showToast('Error', 'Error accessing camera: ' + error.message, 'error');
            this.showMobileInput = true; // Fallback to file input on error
            if (error.name === 'NotAllowedError') {
                this.showToast('Error', 'Camera access denied. Please check your permissions.', 'error');
            } else if (error.name === 'NotFoundError') {
                this.showToast('Error', 'No camera found on this device.', 'error');
            } else {
                this.showToast('Error', 'Error accessing camera: ' + error.message, 'error');
            }
        }
    }

    cancelCamera() {
        if (this.videoRef && this.videoRef.srcObject) {
            this.videoRef.srcObject.getTracks().forEach(track => track.stop());
        }
        this.cameraStarted = false;
        this.imageUrl = null;
        this.imageCaptured = false;
        this.showMobileInput = false; // Hide fallback input on cancel
    }

    captureImage() {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoRef.videoWidth;
        canvas.height = this.videoRef.videoHeight;
        canvas.getContext('2d').drawImage(this.videoRef, 0, 0, canvas.width, canvas.height);

        this.imageUrl = canvas.toDataURL('image/png');
        this.imageCaptured = true;
    }

    submitImage() {
        if (!this.imageCaptured || !this.imageUrl) {
            this.showToast('Error', 'No image captured to submit', 'error');
            return;
        }

        const imageData = this.imageUrl.replace('data:image/png;base64,', '');

        saveImage({ imageData: imageData })
            .then(result => {
                this.showToast('Success', 'Image saved successfully', 'success');
                this.cancelCamera();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            })
            .catch(error => {
                console.error('Error saving image:', error);
                this.showToast('Error', 'Error saving image', 'error');
            });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.imageUrl = reader.result;
                this.imageCaptured = true;
            };
            reader.readAsDataURL(file);
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    get disableCapture() {
        return !this.cameraStarted;
    }

    get disableSubmit() {
        return !this.imageCaptured;
    }

    renderedCallback() {
        if (!this.videoRef) {
            this.videoRef = this.template.querySelector('video');
        }
    }
}
