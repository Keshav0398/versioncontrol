import { LightningElement, track, wire } from 'lwc';
import searchProducts from '@salesforce/apex/ProductSearchControllerBarcode.searchProducts';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/jsPDFLibrary';
import updateProductQuantity from '@salesforce/apex/ProductSearchControllerBarcode.updateProductQuantity';
import searchProductsByName from '@salesforce/apex/ProductSearchController.searchProducts';


export default class productSelectorBarcodeTest extends LightningElement {
    @track searchTerm = '';
    @track filteredProducts = [];
    @track selectedProductId;
    @track quantity = 1; // Default quantity is always 1 for barcode
    @track selectedItems = [];
    jsPDFInitialized = false;
    @track productOptions = []; 
    @track manualEntry = {
        name: '',
        mrp: 0,
        sellingPrice: 0,
        quantity: 1 // Default quantity for manual entry
    };

    columns = [
        { label: 'Product Name', fieldName: 'name' },
        { label: 'MRP', fieldName: 'mrp', type: 'currency' },
        { label: 'Selling Price', fieldName: 'sellingPrice', type: 'currency' },
        { label: 'Quantity', fieldName: 'quantity', type: 'number'},
        { label: 'Total Price', fieldName: 'totalPrice', type: 'currency' },
        { label: 'Savings', fieldName: 'savings', type: 'currency' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Remove',
                name: 'remove',
                variant: 'destructive'
            }
        },
    ];

    handleManualInputChange(event) {
        const field = event.target.dataset.field;
        this.manualEntry[field] = event.target.value;
    }

    handleAddManualProduct() {
        const { name, mrp, sellingPrice, quantity } = this.manualEntry;

        if (name && mrp && sellingPrice && quantity) {
            const newProduct = {
                id: this.generateUniqueId(), // Function to generate a unique ID
                name: name,
                mrp: parseFloat(mrp),
                sellingPrice: parseFloat(sellingPrice),
                quantity: parseFloat(quantity, 10),
                totalPrice: parseFloat(sellingPrice) * parseFloat(quantity, 10),
                savings: (parseFloat(mrp) - parseFloat(sellingPrice)) * parseFloat(quantity, 10)
            };

            this.selectedItems = [...this.selectedItems, newProduct];
            this.clearManualEntry(); // Clear input fields after adding
        } else {
            // Optionally, handle error for missing fields
            console.error('All fields are required for manual entry.');
        }
    }

    clearManualEntry() {
        this.manualEntry = {
            name: '',
            mrp: 0,
            sellingPrice: 0,
            quantity: 1
        };
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    generateUniqueId() {
        // Simple unique ID generator (for example, a timestamp)
        return 'manual-' + new Date().getTime();
    }

    get totalPrice() {
        return this.selectedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
    }

    get totalSavings() {
        return this.selectedItems.reduce((sum, item) => sum + item.savings, 0).toFixed(2);
    }

    connectedCallback() {
        // Automatically focus the input field when the component is initialized
        //this.template.querySelector('.barcode-input').focus();
        //c2
        //window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keydown', this.handleF4KeyPress.bind(this));
        
    }

    renderedCallback() {
        // Use renderedCallback to ensure the input field is available in the DOM
        const inputField = this.template.querySelector('.barcode-input');
        if (inputField) {
            inputField.focus();
        }
    }

    disconnectedCallback() {
        // Remove the keydown event listener when the component is disconnected
        //window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keydown', this.handleF4KeyPress.bind(this));
    }

    handleF4KeyPress(event) {
        // Check if the pressed key is F4
        if (event.key === 'F4' || event.keyCode === 115) {
            event.preventDefault(); // Prevent default F4 behavior
            //window.print(); // Trigger the print window
            setTimeout(() => {
                this.handleCreateBill();  // Call the method to generate and print the PDF
            }, 300);
        }
    }

    handleKeyDown(event) {
        // Check if the F4 key is pressed
        if (event.key === 'F4') {
            this.handleCreateBill(); // Trigger the bill creation and print
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
    
        if (actionName === 'remove') {
            this.removeItemFromTable(row.id);
        }
    }
    
    removeItemFromTable(productId) {
        // Filter out the product with the specified ID
        this.selectedItems = this.selectedItems.filter(item => item.id !== productId);
    }

    handleBarcodeScan(event) {
        // Capture the barcode scanner input
        this.searchTerm = event.target.value;

        // Check if the barcode length is more than 10 characters
        if (this.searchTerm && this.searchTerm.length > 10) {
            this.searchProductByBarcode();
        }
    }

    searchProductByBarcode() {
        // Call Apex method to search for exact barcode match
        searchProducts({ searchTerm: this.searchTerm })
            .then(result => {
                if (result.length === 1) { // Exact match found
                    const product = result[0];
                    this.addItemToTable(product);
                } else {
                    console.error('No exact product match found for the scanned barcode');
                }
            })
            .catch(error => {
                console.error('Error fetching products: ', error);
            });
    }

    handleProductNameChange(event) {
        this.searchTerm = event.target.value;

        if (this.searchTerm) {
            this.fetchProductOptions();
        } else {
            this.productOptions = [];
        }
    }

    handleProductNameInput(event) {
        this.searchTerm = event.target.value;

        if (this.searchTerm) {
            this.fetchProductOptions();
        } else {
            this.productOptions = [];
        }
    }

    fetchProductOptions() {
        searchProductsByName({ searchTerm: this.searchTerm })
            .then(result => {
                this.productOptions = result.map(product => ({
                    label: product.Name,
                    value: product.Id
                }));
            })
            .catch(error => {
                console.error('Error fetching products by name: ', error);
            });
    }

    handleProductSelect(event) {
        const selectedProductId = event.target.dataset.id;
        this.selectedProductId = selectedProductId;

        // Optionally, you can find the selected product details and set the search term
        const selectedProduct = this.productOptions.find(product => product.value === selectedProductId);
        if (selectedProduct) {
            this.searchTerm = selectedProduct.label; // Update search term
        }

        // Clear the options after selection
        this.productOptions = [];
    }

    handleQuantityChange(event) {
        this.quantity = event.target.value;
    }

    handleAddProduct() {
        if (this.selectedProductId) {
            const selectedProduct = this.productOptions.find(product => product.value === this.selectedProductId);
            if (selectedProduct) {
                this.addItemToTableText(selectedProduct);
            }
        }
    }

    addItemToTable(product) {
        // Find the index of the product in the selectedItems array
        const productIndex = this.selectedItems.findIndex(item => item.id === product.Id);
    
        if (productIndex !== -1) {
            // If product exists, update the quantity and recalculate totalPrice and savings
            const updatedProduct = { ...this.selectedItems[productIndex] }; // Copy the product object
            updatedProduct.quantity += 1;
            updatedProduct.totalPrice = updatedProduct.sellingPrice * updatedProduct.quantity;
            updatedProduct.savings = (updatedProduct.mrp - updatedProduct.sellingPrice) * updatedProduct.quantity;
    
            // Update the selectedItems array by replacing the modified product at the same index
            this.selectedItems = [
                ...this.selectedItems.slice(0, productIndex),
                updatedProduct,
                ...this.selectedItems.slice(productIndex + 1),
                
            ];
        } else {
            // If product doesn't exist, add it as a new item
            const newProduct = {
                id: product.Id, // Unique ID for each item
                name: product.Name,
                mrp: product.MRP__c,
                sellingPrice: product.Selling_Price__c,
                quantity: 1, // Default quantity is 1 for barcode scanning
                totalPrice: product.Selling_Price__c * 1, // Calculate total price for quantity 1
                savings: (product.MRP__c - product.Selling_Price__c) * 1
            };
    
            // Add the new product to the selectedItems array
            this.selectedItems = [...this.selectedItems, newProduct];
        }
    
        // Clear the search term for the next product scan
        this.searchTerm = '';
        this.template.querySelector('.barcode-input').focus();
    }   
    

    // Load the jsPDF library
    renderedCallback() {
        if (!this.jsPDFInitialized) {
            this.jsPDFInitialized = true;
            loadScript(this, JS_PDF)
                .then(() => {
                    console.log('jsPDF library loaded successfully');
                })
                .catch((error) => {
                    console.error('Error loading jsPDF library', error);
                });
        }
    }

    // Generate PDF when the "Create Bill" button is clicked
    handleCreateBill() {
        if (this.jsPDFInitialized) {
            const doc = new window.jspdf.jsPDF({
                unit: 'mm',
                format: [70, 100] // 70mm width, height dynamic based on content
            });

            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString(); // Format: mm/dd/yyyy or based on locale
            const formattedTime = currentDate.toLocaleTimeString(); // Format: hh:mm:ss AM/PM or based on locale
            const dateTimeText = `Date: ${formattedDate} ${formattedTime}`;
            
    
            // Header and Title
            doc.setFontSize(10); // Reduced font size for title
            doc.text('AAKASH SUPERMARKET', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

            doc.setFontSize(7);
            const pageWidth = doc.internal.pageSize.getWidth();
            const dateTimeXPos = (pageWidth - doc.getTextWidth(dateTimeText)) / 2;
            doc.text(dateTimeText, dateTimeXPos, 15); 
    
            doc.setFontSize(8); // Slightly smaller for subtitle
            doc.text('Product Invoice', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            doc.text('--------------------------', doc.internal.pageSize.getWidth() / 2, 23, { align: 'center' });
    
            // Define column headers and widths
            const headers = ['Sr', 'Product Name', 'QTY', 'MRP', 'Price', 'Total'];
            const columnWidths = [3, 25, 7, 10, 10,10]; // Updated to fit more content in the right space
    
            let yOffset = 28; // Adjust starting position for content


    
            // Render the headers
            headers.forEach((header, index) => {
                const xPosition = columnWidths.slice(0, index).reduce((a, b) => a + b, 5);
                doc.text(header, xPosition, yOffset);
            });
    
            yOffset += 6; // Move the Y offset down for the table rows
    
            // Add product details with smaller font size for table
            doc.setFontSize(7);
    
            this.selectedItems.forEach((item, index) => {
                const productName = item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name;
            
                // Render each column with the adjusted positions
                let currentX = 5; // Start from 5mm for Sr
                doc.text((index + 1).toString(), currentX, yOffset); // Sr
                currentX += columnWidths[0]; // Move to Product Name position
            
                doc.text(productName, currentX, yOffset); // Product Name
                currentX += columnWidths[1]; // Move to QTY position
            
                doc.text(item.quantity.toString(), currentX, yOffset); // QTY
                currentX += columnWidths[2]; // Move to MRP position
            
                doc.text(item.mrp.toFixed(2), currentX, yOffset); // MRP
                currentX += columnWidths[3]; // Move to Price position
            
                doc.text(item.sellingPrice.toFixed(2), currentX, yOffset); // Price
                currentX += columnWidths[4]; // Move to Total Price position
            
                doc.text(item.totalPrice.toFixed(2), currentX, yOffset); // Total Price (5mm from right margin)
            
                yOffset += 6; // Move Y offset for the next row
            });
    
            // Total Amount and Savings
            doc.setFontSize(9); // Slightly larger for totals
            yOffset += 6;
            doc.text(`Total Bill Amount: ${this.totalPrice}`, 5, yOffset);
            doc.text(`You Saved: ${this.totalSavings}`, 5, yOffset + 6);
    
            // Contact info at the bottom
            doc.setFontSize(7);
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.text('Contact: 6268471199', 5, pageHeight - 10);
    
            // Save the PDF
            //doc.save('Aakash_Supermarket_Invoice.pdf');
            // Convert the PDF to a blob and open the print dialog
            const blob = doc.output('blob');
            const blobURL = URL.createObjectURL(blob);

            // Open the PDF in a new window (optional) or directly print
            const newWindow = window.open(blobURL);
            if (newWindow) {
                newWindow.onload = function() {
                    newWindow.focus(); // Focus on the new window
                    newWindow.print(); // Automatically trigger the print dialog
                };
            }

            
    
            // Clear selected items after saving the PDF
            //this.selectedItems = [];

            const productQuantities = {};
            this.selectedItems.forEach(item => {
                productQuantities[item.id] = item.quantity;
            });

            updateProductQuantity({ productQuantities })
            .then(() => {
                console.log('Product quantities updated successfully.');
                this.selectedItems = []; // Clear the selected items after billing
            })
            .catch(error => {
                console.error('Error updating product quantities: ', error);
            });
            this.selectedItems = [];
        } else {
            console.error('jsPDF library not initialized');
        }
    }
    
    
    
}
