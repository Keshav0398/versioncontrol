import { LightningElement,api, wire,track } from 'lwc';
import getOpportunityWithContact from '@salesforce/apex/OpportunityController.getOpportunityWithContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getQuoteWithAccountContact from '@salesforce/apex/OpportunityController.getQuoteWithAccountContact';
import { CurrentPageReference } from 'lightning/navigation';
import VERIFICATION_SCRIPT_INSTRUCTIONS from '@salesforce/label/c.VerificationScriptInstructions';
import Marketing_Preferences_thankyou_text from '@salesforce/label/c.Marketing_Preferences_thankyou_text';
import Marketing_Preferences from '@salesforce/label/c.Marketing_Preferences';
import Authorization from '@salesforce/label/c.Authorization';
import AuthorizationDiscription from '@salesforce/label/c.AuthorizationDiscription';
import CPI_Price_Risers from '@salesforce/label/c.CPI_Price_Risers';
import Switching_Process from '@salesforce/label/c.Switching_Process';
import getPrimaryContactDetails from '@salesforce/apex/OpportunityController.getPrimaryContactDetails';





export default class DisplaySection extends LightningElement {
    @api recordId;
    @track isVisible = false;
    @track selectedOption = '';
    @api quoteId; 
    @track quoteDetails;
    verificationScriptInstructions = VERIFICATION_SCRIPT_INSTRUCTIONS;
    Authorization  = Authorization;
    AuthorizationDiscription = AuthorizationDiscription;
    CPI_Price_Risers = CPI_Price_Risers;
    Switching_Process = Switching_Process;
    Marketing_Preferences = Marketing_Preferences;
    Marketing_Preferences_thankyou_text = Marketing_Preferences_thankyou_text;

    // connectedCallback(){
    //     this.fetchquoteId();

    // }

    // fetchquoteId() {
    //     // Attempt to retrieve quoteId from the custom component
    //     this.quoteId  = this.template.querySelector('c-custom-b2-b-cart-summary').quoteIdx;
        
    //     // Log the retrieved quoteId for debugging
    //     console.log('Fetched quoteId:', this.quoteId); // Debug statement
        
    //     // Check if quoteId is null and log a warning if it is
    //     if (!this.quoteId) {
    //         console.warn('Warning: quoteId is null. Please ensure it is being set correctly in c-custom-b2-b-cart-summary.');
    //     }
        
    //     // Call fetchQuoteWithAccountContact if quoteId is not null
    //     if (this.quoteId) {
    //         this.fetchQuoteWithAccountContact();
    //     }
    // }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
      console.log('Current Page Reference:', JSON.stringify(currentPageReference));
        if (currentPageReference) {
            this.quoteId = currentPageReference.state.c__cartId;  // Assuming recordId is the Quote ID
            console.log('Quote IDx:', this.quoteId);
        }
    }
    


    // Yes/No options for radio buttons
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];
    

    options = [
        { label: 'Proceed', value: 'proceed' },
        { label: 'Hold order', value: 'hold' }
    ];

    selectedAuthorization = '';  
    selectedMarketingPreference = '';  
    selectedEmaildocumentsprocess = '';
    showMarketingSection = false;  
    showEmailInput = false;
    showTelephoneInput = false;
    showLetterInput = false;
    showTextInput = false;
    showCheckboxes = false;
    isNoSelected = true;
     primaryContactEmail = 'N/A';
     primaryContactPhone = 'N/A';
	 @track primarySyncQuote ;
    opportunity;
    error;
    letterValue = '';
    textValue = '';
    primaryContact = {};

    

    get isYes() {
        return this.selectedMarketingPreference === 'yes';
    }

    get isNo() {
        return this.selectedValue === 'no';
    }
  
         handleCancel() {
     this.dispatchEvent(new CustomEvent('closegenerateDocument', {
            detail: 'closegenerateDocument'
        }));
    }

    get isHoldSelected() {
        return this.selectedOption === 'hold';
    }
    
    handlePrevious() {
        // Logic to go back to the previous step or page
        window.history.back(); // This will take the user back to the previous page
    }

    handleAuthorizationChange(event) {
        this.selectedAuthorization = event.detail.value;
        // Show Marketing Preferences section only if "Yes" is selected in Authorization
        this.showMarketingSection = (this.selectedAuthorization === 'yes');
    }

    handleMarketingPreferenceChange(event) {
        this.selectedMarketingPreference = event.detail.value;
        this.showCheckboxes = this.selectedMarketingPreference === 'yes';
    }

    // handleCheckboxChange(event) {
    //     const type = event.target.dataset.type;
    //     if (type === 'email') {
    //         this.showEmailInput = event.target.checked;
	// 		this.fetchQuoteWithAccountContact();
    //     } else if (type === 'telephone') {
    //         this.showTelephoneInput = event.target.checked;
    //         if (this.showTelephoneInput) {
    //             this.fetchQuoteWithAccountContact(); // Fetch contact details when checked
    //         }
    //     } else if (type === 'letter') {
    //         this.showLetterInput = event.target.checked;
    //     } else if (type === 'text') {
    //         this.showTextInput = event.target.checked;
    //     }
    // }

    handleCheckboxChange(event) {
        const checkboxType = event.target.dataset.type;
        if (checkboxType === 'email') {
            this.showEmailInput = event.target.checked; // Show email input if checkbox is checked
        } else if (checkboxType === 'telephone') {
            this.showTelephoneInput = event.target.checked; // Show phone input if checkbox is checked
        }
    }

    fetchOpportunityWithContact() {
	this.baseUrl = window.location.origin;
        const params = (new URL(window.location)).searchParams;
        let opportunityId = params.get('c__recordId');
	console.log(this.opportunityId);
        getOpportunityWithContact({ opportunityId: opportunityId })
            .then(opp => {
                this.opportunity = opp;
                this.error = undefined;
                this.primaryContactPhone = opp.Account?.vlocity_cmt__PrimaryContactId__r?.MobilePhone || 'N/A';
                this.primaryContactEmail = opp.Account?.vlocity_cmt__PrimaryContactId__r?.Email || 'N/A';
				this.primaryContactName=opp.Account?.vlocity_cmt__PrimaryContactId__r?.Name || 'N/A';
				this.primarySyncQuote=opp.SyncedQuoteId || 'N/A';

                // Display success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact details fetched successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.error = error;
                this.opportunity = undefined;

                // Display error message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error fetching Opportunity or contact details',
                        variant: 'error'
                    })
                );
            });
    }

    fetchQuoteWithAccountContact() {
        getQuoteWithAccountContact({ quoteId: this.quoteId })
            .then(quote => {
                this.quoteDetails = quote;
                this.primaryContactPhone = quote.Account?.vlocity_cmt__PrimaryContactId__r?.MobilePhone ;//|| 'N/A';
                console.log('primaryContactPhone'+primaryContactPhone);
                //this.primaryContactEmail = quote.Account?.vlocity_cmt__PrimaryContactId__r?.Email || 'N/A';
                //this.primaryContactName = quote.Account?.vlocity_cmt__PrimaryContactId__r?.Name || 'N/A';

                // Display success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact details fetched successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.error = error;
                this.quoteDetails = undefined;

                // Display error message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error fetching Quote or contact details',
                        variant: 'error'
                    })
                );
            });
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        if (field === 'letter') {
            this.letterValue = event.target.value;
        } else if (field === 'text') {
            this.textValue = event.target.value;
        }
    }
    
    handleEmaildocumentsprocess(event) {
        this.selectedEmaildocumentsprocess = event.detail.value;
        console.log('selectedEmaildocumentsprocess'+selectedEmaildocumentsprocess);
        this.isNoSelected = event.target.value === 'no';
		this.fetchOpportunityWithContact();
    }

    // handleButtonClick() {
    //     this.baseUrl = window.location.origin;
    //     const params = (new URL(window.location)).searchParams;
    //     //let opportunityId = params.get('c__recordId');
    //     console.log('baseUrl'+baseUrl);
		
    //     // var link = this.baseUrl + '/lightning/cmp/vlocity_cmt__vlocityLWCOmniWrapper?c__target=c:docGenerationSampleMultiDocxLwcEnglish&c__layout=lightning&c__tabIcon=custom:custom18?&c__OmniscriptId=' + opportunityId + '&c__SyncQuoteId='+ this.primarySyncQuote;
    //     var link = this.baseUrl + '/lightning/cmp/vlocity_cmt__vlocityLWCOmniWrapper?c__target=c:docGenerationSampleMultiDocxLwcEnglish&c__layout=lightning&c__tabIcon=custom:custom18?&c__OmniscriptId=' + quoteId;
    //     window.open(link, '_blank');
    //     this.isVisible = true;
    //    /* window.location.href = link;  */
    // } 

    handleButtonClick() {
        this.baseUrl = window.location.origin;
        const params = (new URL(window.location)).searchParams;
        
        // Assume `this.quoteId` is already set elsewhere in the component
        console.log('baseUrl: ' + this.baseUrl);
    
        // Construct the link using `this.quoteId` instead of an undefined `quoteId`
        const link = `${this.baseUrl}/lightning/cmp/vlocity_cmt__vlocityLWCOmniWrapper?c__target=c:docGenerationSampleMultiDocxLwcEnglish&c__layout=lightning&c__tabIcon=custom:custom18?&c__OmniscriptId=${this.quoteId}`;
        
        // Open the link in a new tab
        window.open(link, '_blank');

        //open link in same tab
        //window.location.href = link;
        
        this.isVisible = true;
    }
    


    handleOptionChange(event) {
        this.selectedOption = event.detail.value;
    }


    handleReviewDocuments() {
        console.log('Reviewing documents...');
    }

    @wire(getPrimaryContactDetails, { quoteId: '$quoteId' })
    wiredPrimaryContact({ error, data }) {
        if (data) {
            // Assuming you get the data in this structure
            this.primaryContactEmail = data.AccountContactRelations[0]?.Contact.Email;
            console.log('primaryContactEmail'+this.primaryContactEmail);
            this.primaryContactName=data.AccountContactRelations[0]?.Contact.Name;
            console.log('primaryContactName'+this.primaryContactName);
            this.primaryContactPhone = data.AccountContactRelations[0]?.Contact.Phone;
            console.log('primaryContactName'+this.primaryContactPhone);
        } else if (error) {
            console.error(error);
        }
    }


}