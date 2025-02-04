import { LightningElement, track } from 'lwc';
import saveLocation from '@salesforce/apex/LocationController.saveLocation'; // Import the Apex method

export default class CaptureLocation extends LightningElement {
    @track latitude;
    @track longitude;

    handleCaptureLocation() {
        // Check if Geolocation is supported
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                },
                (error) => {
                    console.error('Error getting location: ', error);
                    // Handle error (e.g., show a toast message)
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            // Handle unsupported case (e.g., show a toast message)
        }
    }

    handleSaveLocation() {
        // Prepare the location data to send to Apex
        const locationData = {
            latitude: this.latitude,
            longitude: this.longitude
        };

        // Call the Apex method to save the location
        saveLocation({ locationData })
            .then((result) => {
                // Handle successful save (e.g., show a toast message)
                console.log('Location saved successfully: ', result);
            })
            .catch((error) => {
                // Handle error during save (e.g., show a toast message)
                console.error('Error saving location: ', error);
            });
    }
}
