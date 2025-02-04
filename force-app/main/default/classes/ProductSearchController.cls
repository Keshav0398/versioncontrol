public with sharing class ProductSearchController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> searchProducts(String searchTerm) {
        String searchQuery = '%' + String.escapeSingleQuotes(searchTerm) + '%';
        return [SELECT Id, Name, MRP__c, Selling_Price__c 
                FROM Product2 
                WHERE Barcode__c LIKE :searchQuery 
                LIMIT 10];
    }
}
