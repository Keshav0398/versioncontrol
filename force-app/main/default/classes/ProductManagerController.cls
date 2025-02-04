public with sharing class ProductManagerController {
    @AuraEnabled
    public static void addProducts(List<ProductWrapper> products) {
        List<Product2> productList = new List<Product2>();
        
        for (ProductWrapper product : products) {
            if (product.name != null && product.barcode != null) {
                Product2 newProduct = new Product2();
                newProduct.Name = product.name;
                newProduct.Quantity__c = product.quantity;
                newProduct.Buying_Price__c = product.buyingPrice;
                newProduct.MRP__c = product.mrp;
                newProduct.Selling_Price__c = product.sellingPrice;
                newProduct.Barcode__c = product.barcode;
                productList.add(newProduct);
            }
        }
        
        if (!productList.isEmpty()) {
            insert productList;
        }
    }

    public class ProductWrapper {
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public Integer quantity { get; set; }
        @AuraEnabled public Decimal buyingPrice { get; set; }
        @AuraEnabled public Decimal mrp { get; set; }
        @AuraEnabled public Decimal sellingPrice { get; set; }
        @AuraEnabled public String barcode { get; set; }
    }
}
