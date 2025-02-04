public with sharing class createAttendanceRecordNew {
    @AuraEnabled
    public static String saveImageAsContentVersion(String fileName, String base64Data, String description) {
        try {
            // Decode the base64 data to Blob
            Blob fileBlob = EncodingUtil.base64Decode(base64Data);
            system.debug('description passed to the file createing class> '+description);
            // Create a ContentVersion record
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName;
            contentVersion.VersionData = fileBlob;
            contentVersion.IsMajorVersion = true;
            contentVersion.Description = description; // Populate the description field

            // Insert ContentVersion
            insert contentVersion;

            if (contentVersion != null && contentVersion.Id != null) {
                return contentVersion.Id;
            } else {
                throw new AuraHandledException('Error: ContentVersion insertion failed.');
            }
        } catch (Exception ex) {
            throw new AuraHandledException('Error while saving the image: ' + ex.getMessage());
        }
    }
}
