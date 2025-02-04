public with sharing class CostingSheetController {

    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getPricebookEntries(String opportunityId) {
        Opportunity opp = [SELECT Pricebook2Id FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
        return [SELECT Id, Product2.Name, UnitPrice, Estimated_Landed_Cost__c 
                FROM PricebookEntry 
                WHERE Pricebook2Id = :opp.Pricebook2Id 
                AND IsActive = true];
    }

    @AuraEnabled
    public static Id createQuote(String opportunityId, List<Map<String, Object>> products) {
        Quote newQuote = new Quote();
        newQuote.OpportunityId = opportunityId;
        newQuote.Name = 'Quote for opportunity ' + [SELECT Name FROM Opportunity WHERE Id = :opportunityId LIMIT 1].Name;
        insert newQuote;

        List<QuoteLineItem> quoteLineItems = new List<QuoteLineItem>();
        for (Map<String, Object> product : products) {
            QuoteLineItem qli = new QuoteLineItem();
            qli.QuoteId = newQuote.Id;
            qli.PricebookEntryId = (String) product.get('pricebookEntryId');
            //qli.Quantity = (Integer) product.get('quantity');
            qli.Quantity = Integer.valueOf(String.valueOf(product.get('quantity')));
            qli.UnitPrice = (Decimal) product.get('unitCostToCustomer');
            qli.Product2Id = (String) product.get('productId');
            quoteLineItems.add(qli);
        }
        insert quoteLineItems;
        return newQuote.Id;
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities() {
        return [SELECT Id, Name FROM Opportunity WHERE IsClosed = false];
    }
}
