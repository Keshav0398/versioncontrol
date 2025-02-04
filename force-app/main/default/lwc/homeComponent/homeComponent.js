import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HomeComponent extends NavigationMixin(LightningElement) {
    navigateToTakeService() {
        this[NavigationMixin.Navigate]({
            "type": "standard__webPage",
            "attributes": {
                "url":"/take-service"
            }
        });
    }

    navigateToProvideService() {
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                "url":'/service-page'
            }
        });
    }
}
