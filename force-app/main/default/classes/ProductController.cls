public with sharing class ProductController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts(String searchString, String sortBy, String category) {
        String baseQuery = 'SELECT Id, Name, Description, DisplayUrl, ' +
                           '(SELECT UnitPrice FROM PricebookEntries WHERE IsActive = true LIMIT 1) ' +
                           'FROM Product2 ' +
                           'WHERE CreatedDate > 2024-09-22T00:00:00Z';

        // Initialize a list to hold conditions for dynamic query
        List<String> conditions = new List<String>();

        // If a search term is provided, add to conditions
        if (searchString != null && searchString != '') {
            conditions.add('Name LIKE \'%' + searchString + '%\'');
        }

        // If a category is provided, add to conditions
        if (category != null && category != '') {
            conditions.add('Category__c = :category'); // Adjust as needed
        }

        // Combine conditions into the base query
        if (!conditions.isEmpty()) {
            baseQuery += ' AND ' + String.join(conditions, ' AND ');
        }

        // Apply sorting based on the user's selection
        if (sortBy == 'priceAsc') {
            baseQuery += ' ORDER BY PricebookEntries.UnitPrice ASC';
        } else if (sortBy == 'priceDesc') {
            baseQuery += ' ORDER BY PricebookEntries.UnitPrice DESC';
        } else if (sortBy == 'popularity') {
            baseQuery += ' ORDER BY Popularity__c DESC'; // Assuming you have a Popularity__c field
        }

        // Execute the query and return the results
        List<Product2> results = Database.query(baseQuery);
        system.debug('result from SOQL:'+results);
        return results;
        
        //return Database.query(baseQuery);
       // return Database.query(baseQuery);
    }

    @AuraEnabled
    public static void addToCart(Id productId, Integer quantity) {
        system.debug(quantity);
        List<Cart__c> existingItems = [SELECT Id, Quantity__c
                                       FROM Cart__c 
                                        WHERE Product__c = :productId];
                                        

        if (!existingItems.isEmpty()) {
            Cart__c existingItem = existingItems[0];
            existingItem.Quantity__c += quantity;
            update existingItem;
        } else {
            Cart__c newItem = new Cart__c();
            newItem.Product__c = productId;
           // newItem.Price__c = Product__c.Price__c;
            newItem.Quantity__c = quantity;
            //newItem.User__c = UserInfo.getUserId();
            insert newItem;
        }
    }
    //get cart item
    @AuraEnabled(cacheable=true)
    public static List<Cart__c> getCartItems() {
        return [
            SELECT Id,Product__r.Name,Quantity__c,Product__r.Price__c 
            FROM Cart__c];
        
    }
    
    @AuraEnabled
public static Order createOrderAndAddProducts(List<Id> cartItemIds) {
    System.debug('Received cart item IDs: ' + cartItemIds); // Debugging line

    // Get the logged-in user's account
  /*  User currentUser = [SELECT Id, AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
    if (currentUser.AccountId == null) {
        throw new AuraHandledException('The logged-in user does not have an associated Account.');
    }*/

    // Create a new order using the user's account
    Order order = new Order(
        AccountId = '001dL00000Up001QAB',
        ContractId = '800dL00000PRFzHQAX',
        Status = 'Draft',
        EffectiveDate = System.today()
    );
    insert order;
    system.debug('Order Created:'+order);

    // Fetch the cart items
    List<Cart__c> cartItems = [SELECT Id, Product__c, Quantity__c FROM Cart__c WHERE Id IN :cartItemIds];
system.debug('Cart Items:'+cartItems);
    // Check if cartItems is empty
    if (cartItems.isEmpty()) {
        throw new AuraHandledException('No valid cart items found for the provided IDs.');
    }

    // Prepare list of OrderItems and a map for Pricebook Entries
    List<OrderItem> orderItems = new List<OrderItem>();
    Set<Id> productIds = new Set<Id>();

    // Collect Product Ids for bulk querying Pricebook Entries
    for (Cart__c cartItem : cartItems) {
        productIds.add(cartItem.Product__c);
    }
    
    // Fetch Pricebook Entries in a single query
    Map<Id, PricebookEntry> pricebookEntryMap = new Map<Id, PricebookEntry>(
        [SELECT Id, Product2Id, UnitPrice 
         FROM PricebookEntry 
         WHERE Pricebook2.Name = 'Maharashtra' 
         AND Product2Id IN :productIds
        ]
    );
    system.debug('PBE details:'+pricebookEntryMap);

    for (Cart__c cartItem : cartItems) {
        // Check if a corresponding Pricebook Entry exists
        if (pricebookEntryMap.containsKey(cartItem.Product__c)) {
            PricebookEntry entry = pricebookEntryMap.get(cartItem.Product__c);
            OrderItem orderItem = new OrderItem(
                OrderId = order.Id,
                Quantity = cartItem.Quantity__c,
                PricebookEntryId = entry.Id,
                UnitPrice = entry.UnitPrice
            );
            orderItems.add(orderItem);
        } else {
            System.debug('No Pricebook Entry found for Product: ' + cartItem.Product__c);
        }
    }

    // Insert order items if any exist
    if (!orderItems.isEmpty()) {
        insert orderItems;
        system.debug('OrderItems:'+orderItems);
    }

    // Optionally, clear cart items after the order is created
    delete cartItems;

    return order;
}

    // Delete all cart items
     @AuraEnabled
    public static void clearCart() {
        // Assuming you have a Cart__c object representing the cart
        List<Cart__c> cartItems = [SELECT Id FROM Cart__c]; // Adjust the query as needed
        if (!cartItems.isEmpty()) {
            delete cartItems; 
        }
    }
    //clear per product from the cart
    @AuraEnabled
    public static void deleteCartItem(Id cartItemId) {
        try {
            // Query to check if the cart item exists
            Cart__c cartItem = [SELECT Id FROM Cart__c WHERE Id = :cartItemId LIMIT 1];
            
            if (cartItem != null) {
                // Delete the item
                delete cartItem;
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting cart item: ' + e.getMessage());
        }
    }
}