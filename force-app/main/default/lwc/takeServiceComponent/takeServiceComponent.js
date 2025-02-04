import { LightningElement, track, wire } from 'lwc';
import getServiceProviders from '@salesforce/apex/ServiceController.getServiceProviders';

export default class TakeServiceComponent extends LightningElement {
    @track selectedMainCategory = '';
    @track selectedSubCategory = '';
    @track serviceProviders = [];
    @track subCategoryOptions = [];

    // Define the main category options
    mainCategoryOptions = [
        { label: 'Home Services', value: 'Home Services' },
        { label: 'Health & Wellness', value: 'Health & Wellness' },
        { label: 'Beauty & Personal Care', value: 'Beauty & Personal Care' },
        { label: 'Automotive', value: 'Automotive' },
        { label: 'Professional Services', value: 'Professional Services' },
        { label: 'Education & Tutoring', value: 'Education & Tutoring' },
        { label: 'Event Services', value: 'Event Services' },
        { label: 'Manpower Services', value: 'Manpower Services' },
        { label: 'Tech Services', value: 'Tech Services' },
        { label: 'Delivery & Logistics', value: 'Delivery & Logistics' }
    ];

    // Watch for changes in main category selection
    handleMainCategoryChange(event) {
        this.selectedMainCategory = event.detail.value;
        this.updateSubCategoryOptions();
    }

    // Update the subcategory options based on the main category selected
    updateSubCategoryOptions() {
        switch (this.selectedMainCategory) {
            case 'Home Services':
                this.subCategoryOptions = [
                    { label: 'Carpenter', value: 'Carpenter' },
                    { label: 'Plumber', value: 'Plumber' },
                    { label: 'Electrician', value: 'Electrician' },
                    { label: 'Painter', value: 'Painter' },
                    { label: 'Handyman', value: 'Handyman' },
                    { label: 'Home Cleaning', value: 'Home Cleaning' },
                    { label: 'Pest Control', value: 'Pest Control' },
                    { label: 'Gardening', value: 'Gardening' },
                    { label: 'AC Repair & Maintenance', value: 'AC Repair & Maintenance' },
                    { label: 'Appliance Repair', value: 'Appliance Repair' }
                ];
                break;
            case 'Health & Wellness':
                this.subCategoryOptions = [
                    { label: 'Doctor', value: 'Doctor' },
                    { label: 'Dentist', value: 'Dentist' },
                    { label: 'Physiotherapist', value: 'Physiotherapist' },
                    { label: 'Nutritionist/Dietitian', value: 'Nutritionist/Dietitian' },
                    { label: 'Personal Trainer', value: 'Personal Trainer' },
                    { label: 'Yoga Instructor', value: 'Yoga Instructor' },
                    { label: 'Massage Therapist', value: 'Massage Therapist' },
                    { label: 'Psychologist/Counselor', value: 'Psychologist/Counselor' }
                ];
                break;
            case 'Beauty & Personal Care':
                this.subCategoryOptions = [
                    { label: 'Barber', value: 'Barber' },
                    { label: 'Hairstylist', value: 'Hairstylist' },
                    { label: 'Beautician', value: 'Beautician' },
                    { label: 'Makeup Artist', value: 'Makeup Artist' },
                    { label: 'Manicure/Pedicure Services', value: 'Manicure/Pedicure Services' },
                    { label: 'Spa Services', value: 'Spa Services' }
                ];
                break;
            // Add additional cases for the rest of the main categories
            default:
                this.subCategoryOptions = [];
                break;
        }
    }

    // Handle subcategory selection
    handleSubCategoryChange(event) {
        this.selectedSubCategory = event.detail.value;
    }

    // Search for service providers based on selected main and subcategories
    handleSearchServiceProviders() {
        getServiceProviders({
            mainCategory: this.selectedMainCategory,
            subCategory: this.selectedSubCategory
        })
        .then(result => {
            this.serviceProviders = result;
        })
        .catch(error => {
            console.error('Error retrieving service providers:', error);
        });
    }

    handleCall(event) {
        const phoneNumber = event.target.dataset.number;
        window.open(`tel:${phoneNumber}`);
    }

    handleRedirectToMap(event) {
        const latitude = event.target.dataset.latitude;
        const longitude = event.target.dataset.longitude;
        if (latitude && longitude) {
            const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
            window.open(googleMapsUrl, '_blank');
        }
    }
}
