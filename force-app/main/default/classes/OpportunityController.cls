public with sharing class OpportunityController {
    @AuraEnabled(cacheable=true)
    public static Opportunity getOpportunityWithContact(Id opportunityId) {
        // Query the Opportunity, Account, and Primary Contact related information
        Opportunity opp = [SELECT Id, AccountId,Account.Name, 
                            Account.vlocity_cmt__PrimaryContactId__r.Email, 
                            Account.vlocity_cmt__PrimaryContactId__r.MobilePhone,
                            Account.vlocity_cmt__PrimaryContactId__r.Name,SyncedQuoteId
                            FROM Opportunity 
                            WHERE Id = :opportunityId 
                            LIMIT 1];       
        return opp;
    }
    
     @AuraEnabled(cacheable=true)
    public static void updateOpportunityAndQuote(String opportunityId) {
        Opportunity opp = [SELECT Id, StageName FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
        Quote relatedQuote = [SELECT Id, Status FROM Quote WHERE OpportunityId = :opportunityId LIMIT 1];

        // Update Opportunity Status
        opp.StageName = 'Verbal Agreement';
        
        // Update Quote Status
        if (relatedQuote != null) {
            relatedQuote.Status = 'On-Hold';
        }

        // Perform updates
        update opp;
        if (relatedQuote != null) {
            update relatedQuote;
        }
    }
}