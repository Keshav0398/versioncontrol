public with sharing class ProductSearchControllerBarcode {
    
    @AuraEnabled(cacheable=true)
    public static List<Product2> searchProducts(String searchTerm) {
        // Perform exact match on Barcode__c field
        return [SELECT Id, Name, MRP__c, Selling_Price__c, Quantity__c, Barcode__c 
                FROM Product2 
                WHERE Barcode__c = :searchTerm 
                LIMIT 1];
    }

    @AuraEnabled
    public static void updateProductQuantity(Map<Id, Integer> productQuantities) {
        List<Product2> productsToUpdate = new List<Product2>();
        
        for (Id productId : productQuantities.keySet()) {
            Product2 product = [SELECT Id, Quantity__c FROM Product2 WHERE Id = :productId];
            Integer quantitySold = productQuantities.get(productId);
            product.Quantity__c -= quantitySold; // Reduce the quantity by the sold amount
            productsToUpdate.add(product);
        }

        update productsToUpdate;
    }
}
