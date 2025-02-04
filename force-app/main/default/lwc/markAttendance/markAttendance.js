import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createAttendanceRecord from '@salesforce/apex/AttendanceController.createAttendanceRecord';

export default class AttendanceComponent extends LightningElement {
    @track name;
    @track employeeId;
    imageUrl;  // Base64 string of the image

    // Handle input change for name and employee ID
    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field === 'name') {
            this.name = event.target.value;
        } else if (field === 'employeeId') {
            this.employeeId = event.target.value;
        }
    }

    // Handle image upload and convert it to Base64
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];  // Get the base64 data
                this.imageUrl = 'data:image/jpeg;base64,' + base64;

                // Debugging: Log the size of the base64 string
                console.log('Base64 Image Data Length: ', base64.length);
            };
            reader.readAsDataURL(file);
        } else {
            console.error('No file selected.');
        }
    }

    // Handle Mark Attendance button click
    markAttendance() {
        if (this.name && this.employeeId && this.imageUrl) {
            // Check if the base64 image size is within limits (Salesforce has limits on data size)
            const base64Data = this.imageUrl.split(',')[1];
            if (base64Data.length > 5000000) {  // Check if base64 string exceeds 5 MB
                this.showToast('Error', 'Image is too large. Please select a smaller image.', 'error');
                return;
            }

            createAttendanceRecord({
                name: this.name,
                employeeId: this.employeeId,
                imageUrl: this.imageUrl
            })
            .then(result => {
                this.showToast('Success', 'Attendance marked successfully.', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while marking attendance. Please try again.', 'error');
                console.error('Error marking attendance: ', error);
            });
        } else {
            this.showToast('Error', 'All fields are required, including the image.', 'error');
        }
    }

    // Method to show toast messages
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
