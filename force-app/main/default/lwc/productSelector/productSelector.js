import { LightningElement, track, wire } from 'lwc';
import searchProducts from '@salesforce/apex/ProductSearchController.searchProducts';
import { loadScript } from 'lightning/platformResourceLoader';
import JS_PDF from '@salesforce/resourceUrl/jsPDFLibrary';

export default class ProductSelector extends LightningElement {
@track searchTerm = '';
@track filteredProducts = [];
@track selectedProductId;
@track quantity = 1; // Default quantity
@track selectedItems = [];
jsPDFInitialized = false;


columns = [
    { label: 'Product Name', fieldName: 'name' },
    { label: 'MRP', fieldName: 'mrp', type: 'currency' },
    { label: 'Selling Price', fieldName: 'sellingPrice', type: 'currency' },
    { label: 'Quantity', fieldName: 'quantity', type: 'number' },
    { label: 'Total Price', fieldName: 'totalPrice', type: 'currency' },
    { label: 'Savings', fieldName: 'savings', type: 'currency' },
];

// Add this event listener when the component is initialized or in your connectedCallback method
connectedCallback() {
    // Listen for F4 key press (key code 115)
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
}

// Cleanup event listener when the component is disconnected
disconnectedCallback() {
    window.removeEventListener('keydown', this.handleKeyPress.bind(this));
}

// Method to handle F4 key press
handleKeyPress(event) {
    if (event.key === 'F4') {
        this.handleCreateBill();  // Call the method to generate and print the PDF
        setTimeout(() => {
            this.handleCreateBill();  // Call the method to generate and print the PDF
        }, 200);
    }
}

get totalPrice() {
    return this.selectedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
}

// Calculate total savings

get totalSavings() {
    return this.selectedItems.reduce((sum, item) => sum + item.savings, 0).toFixed(2);

}

handleSearchChange(event) {
    this.searchTerm = event.target.value;
    this.searchProducts();
}

handleFocus() {
    // Trigger the product search when the input is focused
    this.searchProducts();
}

@wire(searchProducts, { searchTerm: '$searchTerm' })
searchProducts() {
    if (this.searchTerm) {
        searchProducts({ searchTerm: this.searchTerm })
            .then(result => {
                this.filteredProducts = result.map(product => ({
                    label: product.Name,
                    value: product.Id,
                    mrp: product.MRP__c,
                    sellingPrice: product.Selling_Price__c,
                    savings: product.MRP__c - product.Selling_Price__c
                }));
            })
            .catch(error => {
                console.error('Error fetching products: ', error);
                this.filteredProducts = [];
            });
    } else {
        this.filteredProducts = [];
    }
}

handleProductSelect(event) {
    this.selectedProductId = event.detail.value;
}

handleProductSelectFromSuggestion(event) {
    this.selectedProductId = event.currentTarget.dataset.value;
    this.searchTerm = event.currentTarget.innerText; // Set the input value to the selected product name
    this.filteredProducts = []; // Clear suggestions
    
    // Debug log to confirm selected product ID
    console.log('Selected Product ID:', this.selectedProductId);
}


handleQuantityChange(event) {
    this.quantity = event.target.value;
}

addItem() {
    if (this.selectedProductId && this.quantity > 0) {
        const selectedProduct = this.filteredProducts.find(product => product.value === this.selectedProductId);
        if (selectedProduct) {
            // Find the product in the selectedItems array
            const productIndex = this.selectedItems.findIndex(item => item.id === selectedProduct.value);

            if (productIndex !== -1) {
                // If product exists, update the quantity and recalculate totalPrice and savings
                const updatedProduct = { ...this.selectedItems[productIndex] }; // Copy the product object
                updatedProduct.quantity += parseInt(this.quantity, 10); // Increase the quantity by the new amount
                updatedProduct.totalPrice = updatedProduct.sellingPrice * updatedProduct.quantity; // Recalculate total price
                updatedProduct.savings = (updatedProduct.mrp - updatedProduct.sellingPrice) * updatedProduct.quantity; // Recalculate savings

                // Update the selectedItems array by replacing the modified product at the same index
                this.selectedItems = [
                    ...this.selectedItems.slice(0, productIndex),
                    updatedProduct,
                    ...this.selectedItems.slice(productIndex + 1)
                ];
            } else {
                // If product doesn't exist, add it as a new item
                const totalPrice = selectedProduct.sellingPrice * this.quantity;
                const totalSavings = (selectedProduct.mrp - selectedProduct.sellingPrice) * this.quantity;

                this.selectedItems = [
                    ...this.selectedItems,
                    {
                        id: selectedProduct.value, // Use product ID as unique identifier
                        name: selectedProduct.label,
                        mrp: selectedProduct.mrp,
                        sellingPrice: selectedProduct.sellingPrice,
                        quantity: this.quantity, // Set the initial quantity
                        totalPrice: totalPrice, // Calculate total price
                        savings: totalSavings // Calculate savings for this product
                    }
                ];
            }

            // Reset selected product and quantity
            this.selectedProductId = '';
            this.searchTerm = '';
            this.quantity = 1;
            this.filteredProducts = [];
        } else {
            console.error('Selected product not found!');
        }
    } else {
        console.warn('Product ID or quantity is invalid!');
    }
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
        // Generate PDF when the "Create Bill" button is clicked
    // Generate PDF when the "Create Bill" button is clicked
handleCreateBill() {
    if (this.jsPDFInitialized) {
        const doc = new window.jspdf.jsPDF();

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString(); // Format: mm/dd/yyyy or based on locale
        const formattedTime = currentDate.toLocaleTimeString(); // Format: hh:mm:ss AM/PM or based on locale
        const dateTimeText = `Date: ${formattedDate} ${formattedTime}`;

        // 1. Add Supermarket Name at the Top Center
        doc.setFontSize(16);
        doc.text('AAKASH SUPERMARKET', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        doc.setFontSize(7);
        const pageWidth = doc.internal.pageSize.getWidth();
        const dateTimeXPos = (pageWidth - doc.getTextWidth(dateTimeText)) / 2;
        doc.text(dateTimeText, dateTimeXPos, 15); 

        doc.setFontSize(12);
        doc.text('Product Invoice', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        doc.text('-----------------------------------', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

        // 2. Define column headers for the table (Product Details)
        const headers = ['Product Name', 'Quantity', 'MRP', 'Price', 'Total Price', 'Savings'];
        let yOffset = 50; // Starting Y position for the table

        // Adjust column widths to prevent overlap
        const colWidths = [50, 20, 25, 30, 40, 30]; // Adjust width for each column
        let xOffset = 10;

        headers.forEach((header, index) => {
            doc.text(header, xOffset, yOffset);
            xOffset += colWidths[index]; // Increment by the width of each column
        });

        yOffset += 10; // Move down for table rows

        // 3. Add product details from selectedItems array
        this.selectedItems.forEach(item => {
            xOffset = 10; // Reset xOffset for each row
            doc.text(item.name, xOffset, yOffset);                   // Product Name
            xOffset += colWidths[0]; // Move to next column
            doc.text(item.quantity.toString(), xOffset, yOffset);    // Quantity
            xOffset += colWidths[1];
            doc.text(item.mrp.toFixed(2), xOffset, yOffset);         // MRP
            xOffset += colWidths[2];
            doc.text(item.sellingPrice.toFixed(2), xOffset, yOffset);// Price
            xOffset += colWidths[3];
            doc.text(item.totalPrice.toFixed(2), xOffset, yOffset);  // Total Price
            xOffset += colWidths[4];
            doc.text(item.savings.toFixed(2), xOffset, yOffset);     // Savings
            yOffset += 10; // Move to next line for each item
        });

        // 4. Display total bill amount
        yOffset += 10; // Add some space before the total amount
        doc.setFontSize(14);
        doc.text(`Total Bill Amount: ${this.totalPrice}`, 10, yOffset);
        yOffset += 10;
        doc.text(`You Saved: ${this.totalSavings}`, 10, yOffset);

        // 5. Add contact details at the bottom
        const pageHeight = doc.internal.pageSize.getHeight(); // Get page height for positioning
        doc.setFontSize(12);
        doc.text('Contact to 6268471199', 10, pageHeight - 20);

        // Save the generated PDF
        //doc.save('Aaksh_supermarket_invoice.pdf');

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
    } else {
        console.error('jsPDF library not initialized');
    }
}

}