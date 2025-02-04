import { LightningElement, api, track } from 'lwc';

export default class Lwcchatpack_gmap extends LightningElement 
{
    @api inputParams;
    @track showMap = false;
    @track disableButton = false;
    @track mapURL = '';
    @track mapWidth = '260';
    @track mapHeight = '250';

    connectedCallback() 
    {
        // Check if inputParams is defined and not empty
        if (this.inputParams && this.inputParams.split(':').length > 0) 
        {
            const params = this.inputParams.split(':');

            if (params.length == 6)
            {
                this.mapWidth = params[4];
                this.mapHeight = params[5];
            }
            else if (params.length > 3)
            {
                this.showMap = true;
                this.mapURL = 'https://www.google.com/maps/embed/v1/place?key=' + params[2] + '&q=' + params[3];
            }
        } 
        else 
        {
            console.error('inputParams is undefined or empty.');
        }
    }

    sendLocation(event)
    {
        if (navigator.geolocation) 
        {
            this.disableButton = true;
            navigator.geolocation.getCurrentPosition(this.showPosition.bind(this));
        } 
        else 
        {
            alert('Geolocation is not supported by this browser.');
        }
    }

    showPosition(position) 
    {
        this.dispatchEvent(new CustomEvent('postmessage',{
            detail: 'lwc:hide:' + position.coords.latitude + ',' + position.coords.longitude
        }));
    }
}
