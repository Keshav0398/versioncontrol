import { LightningElement, track } from 'lwc';
import fetchProducts from '@salesforce/apex/ProductController.getProducts';
import addToCart from '@salesforce/apex/ProductController.addToCart';
import deleteCartItem from '@salesforce/apex/ProductController.deleteCartItem';
import getCartItems from '@salesforce/apex/ProductController.getCartItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import clearCartApex from '@salesforce/apex/ProductController.clearCart';

export default class Dms extends NavigationMixin(LightningElement) {
    @track products = [];
    @track cart = [];
    @track cartCount = 0;
    @track showCart = false;
    @track sortValue = 'featured';
    @track sortOptions = [
        { label: 'Price: Low to High', value: 'priceAsc' },
        { label: 'Price: High to Low', value: 'priceDesc' },
       // { label: 'Popularity', value: 'popularity' }
    ];
    @track searchTerm = '';
    @track category = '';

    connectedCallback() {
        this.fetchAllProducts();
        this.loadCartItems(); // Load cart items on component initialization
    }

    handleViewCart() {
        // Navigate to the cart page
        this.showCart = true;
    }

    handleCloseCart() {
        this.showCart = false;
    }

    fetchAllProducts() {
        fetchProducts({ searchString: '', sortBy: this.sortValue })
            .then((result) => {
                this.products = result.map(product => ({
                    ...product,
                    price: product.PricebookEntries && product.PricebookEntries.length > 0 
                        ? product.PricebookEntries[0].UnitPrice 
                        : 'N/A',
                    quantity: 1 // Initialize quantity
                }));
            })
            .catch((error) => {
                console.error('Error fetching products: ', error);
            });
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    
        // Debugging: log the current search term
        console.log('Search Term:', this.searchTerm);
    
        if (this.searchTerm.length > 2) {
            // Call Apex method to fetch products based on search term
            fetchProducts({ searchString: this.searchTerm, sortBy: this.sortValue })
                .then((result) => {
                    // Check if result is not null or undefined
                    if (result && Array.isArray(result)) {
                        // Map the results to include price and initial quantity
                        this.products = result.map(product => ({
                            ...product,
                            price: product.PricebookEntries && product.PricebookEntries.length > 0 
                                ? product.PricebookEntries[0].UnitPrice 
                                : 'N/A',
                            quantity: 1
                        }));
                        // Debugging: log the fetched products
                        console.log('Fetched Products:', this.products);
                    } else {
                        // If result is empty or not an array
                        this.products = [];
                        console.warn('No products found.');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching products: ', error);
                    // Optionally, show an error toast
                    this.showToast('Error', 'Error fetching products. Please try again.', 'error');
                });
        } else if (this.searchTerm === '') {
            // Show all products when input is empty
            this.fetchAllProducts();
        }
    }
    
 

    handleSortChange(event) {
        this.sortValue = event.target.value;
        this.sortProducts(); // Refresh product list with sorting
    }

       //added by shubham
            // Sort products based on selected option
            sortProducts() {
                if (this.sortValue === 'priceAsc') {
                    // Sort products by price Low to High
                    this.products.sort((a, b) => a.price - b.price);
                } else if (this.sortValue === 'priceDesc') {
                    // Sort products by price High to Low
                    this.products.sort((a, b) => b.price - a.price);
                }
            }

    updateQuantity(event) {
        const productId = event.target.dataset.id;
        const quantity = parseInt(event.target.value, 10); // Get quantity as an integer
        const product = this.products.find(prod => prod.Id === productId);
        if (product) {
            product.quantity = quantity; // Update the product's quantity

            // Update cart
            const existingCartItem = this.cart.find(item => item.Product__c === productId);
            if (existingCartItem) {
                // Update the existing cart item
                existingCartItem.Quantity__c = quantity;
            } else {
                // If not in the cart, add it
                this.cart.push({
                    Product__c: productId,
                    Quantity__c: quantity,
                    Product_Name__c: product.Name,
                    Product_Price__c: product.price
                });
            }
            this.cartCount = this.cart.reduce((total, item) => total + item.Quantity__c, 0); // Update cart count
        }
    }

    handleAddToCart(event) {
        const productId = event.target.dataset.productId;
        const quantity = this.products.find(prod => prod.Id === productId).quantity;

        addToCart({ productId, quantity }) // Pass the selected quantity
            .then(() => {
                this.showToast('Success', 'Product added to cart', 'success');
                this.loadCartItems(); // Refresh cart items
            })
            .catch(error => {
                console.error('Error adding product to cart:', error);
                this.showToast('Error', 'Error adding product to cart', 'error');
            });
    }
    

    clearCart() {
        clearCartApex()
            .then(() => {
                // Successfully cleared the cart in Apex
                this.cart = []; // Clear local cart state
                // Optionally update any UI or state related to cart quantity
                this.cartQuantity = 0; // Assuming you have a cartQuantity variable
                // Notify the user (optional)
                this.showToast('Success', 'Cart has been cleared.', 'success');
            })
            .catch(error => {
                // Handle any errors from the Apex call
                this.showToast('Error', error.body.message, 'error');
            });
    }

    increaseQuantity(event) {
        const productId = event.target.dataset.productId;
        // Logic to increase quantity
    }
    
    decreaseQuantity(event) {
        const productId = event.target.dataset.productId;
        // Logic to decrease quantity
    }
    
    removeItem(event) {
        const productId = event.target.dataset.productId;
        // Logic to remove the item from the cart
    }

    loadCartItems() {
        getCartItems() // Fetch cart items from the server
        
            .then((items) => {
                this.cart = items.map(item => ({
                    ...item,
                    Name: item.Product__r.Name,
                    Quantity__c: item.Quantity__c,
                    Price__c: item.Product__r.Price__c
                }));
                this.cartCount = items.reduce((total, item) => total + item.Quantity__c, 0); // Update cart count
            })
            .catch((error) => {
                console.error('Error fetching cart items:', error);
            });
    }
    handleDelete(event) {
        event.preventDefault(); 
        const cartItemId = event.target.dataset.id; // Get the cart item ID
    
        deleteCartItem({ cartItemId })
            .then(() => {
                this.showToast('Success', 'Item deleted from cart', 'success');
                // Remove item from cartItems array directly without reloading
                this.cartItems = this.cartItems.filter(item => item.Id !== cartItemId);
                
                // Recalculate total price after removing an item
                this.calculateTotalPrice();
            })
            .catch(error => {
                console.error('Error deleting item from cart:', error);
               // this.showToast('Error', 'Error deleting item from cart', 'error');
            });
    }
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}