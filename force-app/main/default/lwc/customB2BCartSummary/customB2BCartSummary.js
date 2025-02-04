import { LightningElement, track, wire,api } from 'lwc';
import { getUserProfile } from "vlocity_cmt/utility";
import B2bCartSummary from 'vlocity_cmt/b2bCartSummary';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadCssFromStaticResource } from "vlocity_cmt/utility";
import pubsub from 'vlocity_cmt/pubsub';
import util from 'vlocity_cmt/b2bNavigationUtil';
import {  fire } from 'vlocity_cmt/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import b2bUtils from "vlocity_cmt/b2bUtils";
import b2bCartSummary from "vlocity_cmt/b2bCartSummary";
import template from "./customB2BCartSummary.html";
import { RefreshEvent } from 'lightning/refresh';
import { NavigationMixin } from 'lightning/navigation';

import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin';
import { loadStyle } from 'lightning/platformResourceLoader'; 
import customCSS from '@salesforce/resourceUrl/modalCloseButton'; 
    export default class customB2BCartSummary extends OmniscriptBaseMixin(b2bCartSummary){
    @track showModalContract = false;
    @track isDisabled = true;
	@track isFlagTrue = true;
	@track showModalAddrVal = false;
    @track showDocument = false;
    @track showModalSQ = false;
    @track showModalAppointment = false;
	@track b2bTableData;
    @track showAddressValidation = false;
    @api quoteID;
    
  // your properties and methods here
  connectedCallback() {
    super.connectedCallback();
    
    this.actionList.push( { label: 'Create Billing Account', method: 'billingAccountCreation',"showItem":true});
    this.actionList.push( { label: 'Provisional Date', method: 'getAppointmentDetails',"showItem":true});
    this.actionList.push( { label: 'Generate Document', method: 'generateDocuments',"showItem":true});
     this.actionList.push( { label: 'Credit Check1', method: 'creditCheck',"showItem":true});
    this.showModalSQ = false;
    this.isvisble = true;
    this.b2bTableData = [...this.b2bTableData];
    //this.template.addEventListener('subcategoryselection', this.handleSelectionChange.bind(this));
    this.closeButton = document.querySelector('.modal-close-btn.slds-button_icon-inverse');
	
    }


	validateAddresses() { 
		let selectedIds = this.route.memberUpload.data[this.memberType].tableData.filter(data=>data.isSelected);
		console.log('selectedIds',JSON.stringify(selectedIds));
        
		if (selectedIds.length == 0) {
			this.showToast(`${this.labels.CMEXError}`, `${this.labels.CMEXValidationError}`, "warning", this);
			return
		}
		/*
    selectedIds.forEach(e=>{
			this.rowId = e.originalIndex;
			pubsub.fire('Validate-Address', 'data', {
			"selectedRowIndex":this.rowId       	
			
			});
	    });
    */
    
//poc to open modal and validate address
    this.b2bTableData = this.route.memberUpload.data[this.memberType].tableData;
	console.log('abc',this.b2bTableData);
    this.showModalAddrVal = true;
    setTimeout(() => this.template.querySelector('[data-id="showModalAddrVal"]').openModal());
    loadStyle(this,customCSS);
	}
   closeAddrValModal(evt) {
    this.showModalAddrVal = false;
    this.modal = this.template.querySelector('[data-id="showModalAddrVal"]');
     this.modal.closeModal();
    
    if(evt.detail == 'saveQM'){
      //  location.reload();
      super.validateAddresses();
      //pubsub.fire('handleMemberRefresh',null);
        
      
    }
    
  }
  // Invoke the screen flow //
  creditCheck(){
   
    const quoteId = this.quoteId; // Assume you pass the quoteId to this component or fetch it
    console.log(this.quoteId);
    const inputVariables = [
        { name: 'quoteId', type: 'String', value: quoteId }
    ];
    // Start the flow
    this.template.querySelector("lightning-flow").startFlow("Credit_Check", inputVariables);
         
  }
//to generate document
generateDocuments() { 
	//let selectedIds = this.route.memberUpload.data[this.memberType].tableData.filter(data=>data.isSelected);     
    //this.b2bTableData = this.route.memberUpload.data[this.memberType].tableData;
    this.showDocument = true;
    setTimeout(() => this.template.querySelector('[data-id="showDocument"]').openModal());
	}   
    closegenerateDocument() {
    this.showDocument = false;
    this.modal = this.template.querySelector('[data-id="showDocument"]');
     this.modal.closeModal();
	 }

	billingAccountCreation(){
		  let qliPresent = this.route.memberUpload.data[this.memberType].tableData.filter(data => data.isSelected)
			console.log('qliPresent',JSON.stringify(qliPresent));
      if (qliPresent.length == 0) {
        this.showToast(
          `${this.labels.CMEXError}`, 
          "You need to select at least one location to create a Billing Account.", 
          "warning", 
          this
      );
        return
      }
      let isQLIPresentValue = qliPresent[0].isQLIPresent;
      console.log(isQLIPresentValue);
		  this.baseUrl = window.location.origin
			const params = (new URL(window.location)).searchParams;
			const accountId = params.get('c__accountId');
			const quote = params.get('c__cartId');
			const quotename = params.get('c__cartName');
            let selectedIds = this.route.memberUpload.data[this.memberType].tableData.filter(data => data.isSelected).map(data => data.Id);
			console.log(selectedIds);
            const mappedIds = selectedIds.map(id => ({ Id: id }));
            console.log(mappedIds);
            console.log("accId", accountId);
			let validate = selectedIds.filter(data=>data.Id);
			console.log(this.validate);
            this.prefill = JSON.stringify({"ContextId" : accountId, "SiteId" : mappedIds, "isQLIPresent" : isQLIPresentValue});
            console.log("prefill",this.prefill);	
            if(!isQLIPresentValue){
              const event = new ShowToastEvent({
                title: 'Error',
                message: 'Please add an product to proceed with Billing account creation',
                variant: 'Warning'
              });
              this.dispatchEvent(event);

            }else{
            this.showModalContract = true;
            setTimeout(() => {
              this.modal = this.template.querySelector('[data-id="actionModal"]');
              this.modal.openModal();
            });	
          }

	}
  getAppointmentDetails(){
		this.baseUrl = window.location.origin
		const params = (new URL(window.location)).searchParams;
		const quote = params.get('c__cartId');
    let selectedIds = this.route.memberUpload.data[this.memberType].tableData.filter(data => data.isSelected).map(data => data.Id);
    const qmIds = selectedIds.map(id => ({ qmId: id }));
    this.prefill = JSON.stringify({"ContextId" : quote, "qmId" : selectedIds[0]});
    console.log("Prefill",this.prefill);
    this.showModalAppointment = true;
    setTimeout(() => {
      this.modal = this.template.querySelector('[data-id="bookingModal"]');
      this.modal.openModal();
    });	
	}


   handleCancel(){
    this.showModalAppointment = false;
}
			
  executeAction(evt) {
    console.log('clicked here');
    //creditCheck();
    const func = evt.currentTarget.dataset.method;
    this[func]();
  }

//   applyAdjustment() {
//     //custom code here
//     alert('Apply Adjustment');
//   }

  navigateToQuote() {
    
    // Navigate to the Quote
    window.open("/" + super.route.Quote.id, "_self");
  }

//   testOmniScript() {

//     let os = "c:testTest1English";
//     let contextId = super.route.Quote.id;

//     // Build the OmniScript URL
//     let url = "/lightning/cmp/vlocity_cmt__vlocityLWCOmniWrapper?c__target=" + os + "&c__layout=lightning&c__ContextId=" + contextId;

//     window.open(url, "_self");
//   }
//on click of Servicequalification 
checkServiceability() {
  let tableMembers = this.route.memberUpload.data[this.memberType]?.tableData.filter(data => data.isSelected);
  if (!tableMembers || tableMembers.length == 0) {
    console.log('No members selected');
    this.showToast(`${this.labels.CMEXError}`, `${this.labels.CMEXServiceQualificationError}`, "warning", this);
    return;
  }
	let isNotValidated = tableMembers.some(item => item.ValidationStatus__c === "Not validated");
	if (isNotValidated) {
    this.showToast("Warning", "Please complete the address Validation for the selected site before proceeding with Service Availability", "warning", this);
	}

	else{
	  this.b2bTableData = this.route.memberUpload.data[this.memberType].tableData;
	  console.log('Members selected, opening modal');
	  this.showModalSQ = true;
	  setTimeout(() => this.template.querySelector('[data-id="showModalSQ"]').openModal());
	   loadStyle(this,customCSS); 
	}
}

closeModal(evt) {
	this.isFlagTrue = true;
	this.showModalSQ = false;
	this.template.querySelector('[data-id="showModalSQ"]').closeModal();

	if(evt.detail == 'saveSQ'){
		let tableMembers = this.route.memberUpload.data[this.memberType]?.tableData.filter(data => data.isSelected);
		this.showToast("", `${this.labels.CMEXServiceabilityCheckForLocationsDone.replace('{0}', tableMembers.length)}`, "success", this);
		pubsub.fire('b2b-member-refresh', "action", {});
    }
        
}



handleNext() {
  const serviceQualification = this.template.querySelector('c-service-qualification'); // Get the service qualification component
  if (serviceQualification) {
      serviceQualification.subcategorylist(); // Call the subcategorylist method in ServiceQualification
  }
  else{
    console.error('ServiceQualification component not found');
  }

}

 

}