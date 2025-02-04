import { LightningElement, track } from 'lwc';
import saveImageAsContentVersion from '@salesforce/apex/createAttendanceRecordNew.saveImageAsContentVersion';
import saveAttendanceRecord from '@salesforce/apex/AttendanceRecordHandler.saveAttendanceRecord';
import linkContentToAttendance from '@salesforce/apex/ContentAttendanceLinker.linkContentToAttendance';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MarkAttendanceNew extends LightningElement {
    @track imageUrl;
    @track base64ImageData;
    @track isSaveDisabled = true;
    @track isLoading = false;
    name = '';
    employeeId = '';

    handleImageCapture(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Image loaded successfully.');
                this.imageUrl = reader.result; // Display the image on the UI
                this.base64ImageData = reader.result.split(',')[1]; // Strip the metadata from the base64 string
                this.isSaveDisabled = false;
                console.log('Base64 Image Data:', this.base64ImageData);
            };
            reader.readAsDataURL(file);
        }
    }

    handleNameChange(event) {
        this.name = event.target.value;
        console.log('Name changed to:', this.name);
    }

    handleEmployeeIdChange(event) {
        this.employeeId = event.target.value;
        console.log('Employee ID changed to:', this.employeeId);
    }

    async saveImage() {
        this.isLoading = true;
        console.log('Starting the save process...');
    
        const currentDate = new Date();
        const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
    
        // Unique description: Name + Date + Time + Employee ID
        const description = `${this.name}_${dateString}_${timeString}_${this.employeeId}`;
        console.log('Description================>:', description);
    
        const fileName = `Attendance_${description}.jpg`;
    
        try {
            // Step 1: Save ContentVersion with the description
            console.log('Calling saveImageAsContentVersion...');
            const contentVersionId = await saveImageAsContentVersion({ fileName, base64Data: this.base64ImageData, description });
            console.log('ContentVersion ID:', contentVersionId);
            
            if (!contentVersionId) {
                throw new Error('Failed to save ContentVersion');
            }
    
            // Step 2: Save the attendance record with the same description
            console.log('Calling saveAttendanceRecord...');
            const attendanceId = await saveAttendanceRecord({ name: this.name, employeeId: this.employeeId, description });
            console.log('Attendance Record ID:', attendanceId);
    
            // Step 3: Show success message
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Image and attendance record saved successfully!',
                variant: 'success',
            }));
    
            // Reset the form
            this.imageUrl = null;
            this.base64ImageData = null;
            this.name = '';
            this.employeeId = '';
            this.isSaveDisabled = true;
    
        } catch (error) {
            console.error('Error while saving image and record:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error while saving image and record: ' + error.message,
                variant: 'error',
            }));
        } finally {
            this.isLoading = false;
            console.log('Save process completed.');
        }
    }
    
}
