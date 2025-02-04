import { LightningElement } from 'lwc';
import logoUrl from '@salesforce/resourceUrl/freeManzilLogo';

export default class LogoComponent extends LightningElement {
    logoUrl = logoUrl; // URL for the logo from the static resource
}
