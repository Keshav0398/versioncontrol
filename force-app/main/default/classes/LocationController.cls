public with sharing class LocationController {
    @AuraEnabled
    public static void saveLocation(Map<String, Decimal> locationData) {
        // Create a new record of your desired object
        My_Location_Object__c locationRecord = new My_Location_Object__c(); // Replace with your object API name
        locationRecord.Latitude__c = locationData.get('latitude');
        locationRecord.Longitude__c = locationData.get('longitude');
        
        // Insert the record
        insert locationRecord;
    }
}
