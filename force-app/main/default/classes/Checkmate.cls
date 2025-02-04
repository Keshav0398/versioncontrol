public class Checkmate {
    @AuraEnabled
    public static void saveProducts(List<ProductWrapper> products) {
        List<Product2> productList = new List<Product2>();
        
        for (ProductWrapper prod : products) {
            Product2 p = new Product2();
            p.Name = prod.name;
            p.Quantity__c = prod.stockQuantity;
            p.Buying_Price__c = prod.buyingPrice;
            p.MRP__c = prod.mrp;
            p.Selling_Price__c = prod.sellingPrice;
            p.Barcode__c = prod.barcode;
            productList.add(p);
        }
        
        try {
            insert productList;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving products: ' + e.getMessage());
        }
    }

}
