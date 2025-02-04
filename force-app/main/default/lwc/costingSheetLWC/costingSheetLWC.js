import { LightningElement, track } from 'lwc';
import getPricebookEntries from '@salesforce/apex/CostingSheetController.getPricebookEntries'; // APEX method to fetch Pricebook Entries
import createQuote from '@salesforce/apex/CostingSheetController.createQuote'; // APEX method to create Quote
import getOpportunities from '@salesforce/apex/CostingSheetController.getOpportunities'; // APEX method to fetch Opportunities
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Import toast event

export default class CostingSheetLWC extends LightningElement {
    @track opportunities = [];
    @track selectedOpportunity = '';
    @track productOptions = [];
    @track selectedProduct = '';
    @track productQuantity = 1;
    @track profitMargin = 50;
    @track installationCost = 0;
    @track contractTerm = 12;
    @track productData = [];
    @track totalCostToDigicel = 0; // To hold the total of TOTAL COST TO DIGICEL
    @track totalOnceOffPrice = 0; // To hold the total of Total Once-Off Price
    currentProductLandedCost = 0;

    // Final overview calculation variables
    @track balDigicelCapex = 0;
    @track mrrCustomerAgrees = 0;
    @track paybackMonthly = 0;
    @track totalMRRTerm = 0;
    @track totalMarginTerm = 0;
    @track roi = 0;

    // Table columns
    columns = [
        { label: 'Product Name', fieldName: 'productName' },
        { label: 'Product Quantity', fieldName: 'quantity' },
        { label: 'Unit Cost to Digicel', fieldName: 'unitCostToDigicel', type: 'currency' },
        { label: 'Total Cost to Digicel', fieldName: 'totalCostToDigicel', type: 'currency' },
        { label: 'Profit Margin (%)', fieldName: 'profitMargin' },
        { label: 'Unit Cost to Customer', fieldName: 'unitCostToCustomer', type: 'currency' },
        { label: 'Monthly Unit Cost to Digicel', fieldName: 'monthlyUnitCostToDigicel', type: 'currency' },
        { label: 'Total Monthly Unit Cost to Digicel', fieldName: 'totalMonthlyUnitCostToDigicel', type: 'currency' },
        { label: 'Monthly Unit Price to Customer', fieldName: 'monthlyUnitPriceToCustomer', type: 'currency' },
        { label: 'Total Once-Off Price', fieldName: 'totalOnceOffPrice', type: 'currency' },
        { label: 'Total Monthly Fee', fieldName: 'totalMonthlyFee', type: 'currency' }
    ];

    connectedCallback() {
        this.loadOpportunities();
    }

    // Fetch opportunities for dropdown
    loadOpportunities() {
        getOpportunities()
            .then(result => {
                this.opportunities = result.map(opp => ({
                    label: opp.Name,
                    value: opp.Id
                }));
            })
            .catch(error => {
                console.error('Error fetching Opportunities:', error);
            });
    }

    // Handle Opportunity selection
    handleOpportunityChange(event) {
        this.selectedOpportunity = event.detail.value;
        this.loadProductOptions();
    }

    // Fetch product options from Pricebook Entry for selected Opportunity
    loadProductOptions() {
        if (!this.selectedOpportunity) {
            return;
        }
        getPricebookEntries({ opportunityId: this.selectedOpportunity })
            .then(result => {
                this.productOptions = result.map(entry => ({
                    label: entry.Product2.Name,
                    value: entry.Id,
                    product2Id: entry.Product2Id,
                    unitPrice: entry.UnitPrice,
                    estimatedLandedCost: entry.Estimated_Landed_Cost__c
                }));
            })
            .catch(error => {
                console.error('Error fetching Pricebook Entries:', error);
            });
    }

    handleSearchChange(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.filteredProductOptions = this.productOptions.filter(option =>
            option.label.toLowerCase().includes(searchTerm)
        );
    }

    handleRemoveProduct(event) {
        const productIdToRemove = event.target.dataset.id; // Get the product ID from the button
    
        // Filter out the product that needs to be removed
        this.productData = this.productData.filter(product => product.id !== productIdToRemove);
    
        // Recalculate total cost to Digicel and total once-off price
        this.totalCostToDigicel = this.productData.reduce((total, product) => total + product.totalCostToDigicel, 0);
        this.totalOnceOffPrice = this.productData.reduce((total, product) => total + product.totalOnceOffPrice, 0);
    
        // Update final overview calculations after removal
        this.calculateFinalOverview();
    }



    handleProductChange(event) {
        this.selectedProduct = event.detail.value;
        const product = this.productOptions.find(option => option.value === this.selectedProduct);
        if (product) {
            this.currentProductLandedCost = product.estimatedLandedCost;
        }
    }

    handleQuantityChange(event) {
        this.productQuantity = event.target.value;
    }

    //handleProfitMarginChange(event) {
      //  this.profitMargin = event.target.value / 100; // Convert percentage to decimal
    //}

    handleProfitMarginChange(event) {
        const value = event.target.value; // Get the input value
        this.profitMargin = value ? parseFloat(value) : 0; // Convert to float, handle empty input
    }

    handleInstallationCostChange(event) {
        this.installationCost = event.target.value;
    }

    handleContractTermChange(event) {
        this.contractTerm = event.target.value;
    }

    handleSubmit() {
        const product = this.productOptions.find(option => option.value === this.selectedProduct);

        if (!product) {
            return;
        }

        const unitCostToDigicel = this.currentProductLandedCost;
        const totalCostToDigicel = unitCostToDigicel * this.productQuantity;
        const unitCostToCustomer = (unitCostToDigicel * this.profitMargin) + unitCostToDigicel;
        const monthlyUnitCostToDigicel = unitCostToDigicel / this.contractTerm;
        const totalMonthlyUnitCostToDigicel = this.productQuantity * monthlyUnitCostToDigicel;
        const monthlyUnitPriceToCustomer = unitCostToCustomer / this.contractTerm;
        const totalOnceOffPrice = this.productQuantity * monthlyUnitPriceToCustomer * this.contractTerm;
        const totalMonthlyFee = this.productQuantity * monthlyUnitPriceToCustomer;

        // Add product details to table
        this.productData = [
            ...this.productData,
            {
                id: product.value,
                productName: product.label,
                quantity: this.productQuantity,
                pricebookEntryId: product.value, // Adding PricebookEntryId
                product2Id: product.product2Id,  // Adding Product2Id
                unitCostToDigicel: unitCostToDigicel,
                totalCostToDigicel: totalCostToDigicel,
                profitMargin: this.profitMargin, // Display as percentage
                unitCostToCustomer: unitCostToCustomer,
                monthlyUnitCostToDigicel: monthlyUnitCostToDigicel,
                totalMonthlyUnitCostToDigicel: totalMonthlyUnitCostToDigicel,
                monthlyUnitPriceToCustomer: monthlyUnitPriceToCustomer,
                totalOnceOffPrice: totalOnceOffPrice,
                totalMonthlyFee: totalMonthlyFee
                
            }
        ];

        // Update the total cost to Digicel and total once-off price
        this.totalCostToDigicel = this.productData.reduce((total, product) => total + product.totalCostToDigicel, 0);
        this.totalOnceOffPrice = this.productData.reduce((total, product) => total + product.totalOnceOffPrice, 0);

        // Final Overview Calculation
        this.calculateFinalOverview();

        // Clear the input fields
        this.selectedProduct = '';
        this.productQuantity = 1;
        this.profitMargin = 0;
        this.installationCost = 0;
        this.contractTerm = 12;
    }

    calculateFinalOverview() {
        this.balDigicelCapex = this.totalCostToDigicel - this.installationCost;
        this.mrrCustomerAgrees = this.balDigicelCapex / this.contractTerm;
        this.paybackMonthly = this.balDigicelCapex / this.mrrCustomerAgrees;
        this.totalMRRTerm = this.mrrCustomerAgrees * this.contractTerm;
        this.totalMarginTerm = this.totalMRRTerm + this.totalCostToDigicel + this.installationCost;
        this.roi = ((this.totalOnceOffPrice - this.totalCostToDigicel) / this.totalCostToDigicel); // ROI in percentage
    }

    // Handle "Generate Quote" button click
    handleGenerateQuote() {
        createQuote({ opportunityId: this.selectedOpportunity, products: this.productData })
            .then(result => {
                console.log('Quote Created, ID:', result);
                // Optionally, show a success message or navigate to the newly created Quote.
                this.showToast('Success', 'Quote has been successfully created!', 'success'); // Show success message
            })
            .catch(error => {
                console.error('Error creating Quote:', error);
                this.showToast('Error', 'Error creating Quote: ' + error.body.message, 'error'); // Show error message
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

}
