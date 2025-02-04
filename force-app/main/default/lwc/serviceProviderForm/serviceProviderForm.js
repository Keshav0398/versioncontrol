import { LightningElement, track } from 'lwc';
import saveService from '@salesforce/apex/ServiceController.saveService';
import getServiceProviders from '@salesforce/apex/ServiceController.getServiceProviders';

export default class ServiceProviderForm extends LightningElement {
    @track companyName = '';
    @track serviceProviderName = '';
    @track contactInfo = '';
    @track address = '';
    @track mainCategory = '';
    @track subCategory = '';
    @track about = " ";

    @track latitude;
    @track longitude;
    
    @track filterMainCategory = '';
    @track filterSubCategory = '';
    @track serviceProviders = [];

    // Define the main and subcategory options
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

    subCategoryOptions = [
        { label: 'Carpenter', value: 'Carpenter' },
        { label: 'Plumber', value: 'Plumber' },
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Barber', value: 'Barber' },
        { label: 'Mechanic', value: 'Mechanic' },
        { label: 'Lawyer', value: 'Lawyer' },
        { label: 'Caterer', value: 'Caterer' },
        { label: 'Security Guard Services', value: 'Security Guard Services' },
        { label: 'Computer Repair', value: 'Computer Repair' },
        { label: 'Courier Services', value: 'Courier Services' }
        // Add more subcategories as needed
    ];

    // Handle input changes for the form
    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    // Handle main category change for the form
    handleMainCategoryChange(event) {
        this.mainCategory = event.detail.value;
    }

    // Handle subcategory filter for search
    handleFilterMainCategoryChange(event) {
        this.filterMainCategory = event.detail.value;
    }

    handleFilterSubCategoryChange(event) {
        this.filterSubCategory = event.detail.value;
    }

    // Save service method
    // Save service method
    handleSaveService() {
        // Capture user's latitude and longitude
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                    this.saveServiceData();
                },
                () => {
                    // If location access is denied, save without latitude/longitude
                    this.saveServiceData();
                }
            );
        } else {
            // Geolocation not supported, save without latitude/longitude
            this.saveServiceData();
        }
    }

    saveServiceData() {
        saveService({
            companyName: this.companyName,
            serviceProviderName: this.serviceProviderName,
            contactInfo: this.contactInfo,
            address: this.address,
            mainCategory: this.mainCategory,
            subCategory: this.subCategory,
            about: this.about,
            latitude: this.latitude,
            longitude: this.longitude
        })
        .then(() => {
            this.clearForm();
            alert('Service has been saved successfully.');
        })
        .catch(error => {
            console.error('Error saving service:', error);
        });
    }

    // Clear the form after submission
    clearForm() {
        this.companyName = '';
        this.serviceProviderName = '';
        this.contactInfo = '';
        this.address = '';
        this.mainCategory = '';
        this.subCategory = '';
        this.about = '';
        this.latitude = undefined; // Reset latitude
        this.longitude = undefined; // Reset longitude
    }

    // Search service providers based on selected filters
    handleSearchServiceProviders() {
        getServiceProviders({
            mainCategory: this.filterMainCategory,
            subCategory: this.filterSubCategory
        })
        .then(result => {
            this.serviceProviders = result || [];
        })
        .catch(error => {
            console.error('Error retrieving service providers:', error);
        });
    }
}
