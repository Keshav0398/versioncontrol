public with sharing class ContentAttendanceLinker {
    @AuraEnabled
    public static void linkContentToAttendance(String contentVersionId, String attendanceId) {
        try {
            // Get the ContentDocumentId from the ContentVersion
            ContentVersion contentVersion = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];
            Id contentDocumentId = contentVersion.ContentDocumentId;

            // Create a ContentDocumentLink to relate the ContentDocument to the Attendance__c record
            ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
            contentDocumentLink.ContentDocumentId = contentDocumentId;
            contentDocumentLink.LinkedEntityId = attendanceId; // Link to the Attendance__c record
            contentDocumentLink.ShareType = 'V'; // Viewer access
            contentDocumentLink.Visibility = 'AllUsers'; // Or 'InternalUsers' as needed

            insert contentDocumentLink;
        } catch (Exception ex) {
            throw new AuraHandledException('Error while linking content to attendance record: ' + ex.getMessage());
        }
    }
}
