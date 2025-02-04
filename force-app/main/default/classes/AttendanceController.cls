public with sharing class AttendanceController {
    @AuraEnabled
    public static String createAttendanceRecord(String name, String employeeId, String imageUrl) {
        String debugMessage = '';
        System.debug('START: createAttendanceRecord method');
        
        try {
            // Log incoming parameters
            System.debug('Parameters received: Name = ' + name + ', EmployeeId = ' + employeeId + ', ImageUrl = ' + imageUrl);
            debugMessage += 'Parameters received: Name = ' + name + ', EmployeeId = ' + employeeId + '\n';

            // Validate input
            if (String.isEmpty(name) || String.isEmpty(employeeId)) {
                System.debug('Validation failed: Name or EmployeeId is empty');
                throw new AuraHandledException('Name and Employee ID are required fields.');
            }

            // Create Attendance Record
            System.debug('Creating Attendance record...');
            Attendance__c attendance = new Attendance__c();
            attendance.Name = name;
            attendance.EmployeeId__c = employeeId;
            insert attendance;
            System.debug('Attendance record created: ' + attendance.Id);
            debugMessage += 'Attendance record created: ' + attendance.Id + '\n';

            // Process image URL (if provided)
            if (imageUrl != null) {
                System.debug('Processing image data...');
                String base64Data = imageUrl.substringAfter(',');
                Blob imageBlob = EncodingUtil.base64Decode(base64Data);
                System.debug('Image Blob size: ' + imageBlob.size() + ' bytes');

                // Create ContentVersion
                System.debug('Creating ContentVersion for the image...');
                ContentVersion contentVersion = new ContentVersion();
                contentVersion.Title = 'Attendance Image - ' + name;
                contentVersion.PathOnClient = 'AttendanceImage.jpg';
                contentVersion.VersionData = imageBlob;
                insert contentVersion;
                System.debug('ContentVersion created: ' + contentVersion.Id);
                debugMessage += 'ContentVersion created: ' + contentVersion.Id + '\n';

                // Fetch ContentDocumentId from ContentVersion
                System.debug('Fetching ContentDocumentId from the created ContentVersion...');
                List<ContentVersion> versions = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id LIMIT 1];
                if (!versions.isEmpty()) {
                    ContentVersion insertedVersion = versions[0];
                    System.debug('Retrieved ContentDocumentId: ' + insertedVersion.ContentDocumentId);
                    debugMessage += 'Retrieved ContentDocumentId: ' + insertedVersion.ContentDocumentId + '\n';

                    // Create ContentDocumentLink to link the file to the Attendance record
                    System.debug('Creating ContentDocumentLink to link the file to Attendance record...');
                    ContentDocumentLink link = new ContentDocumentLink();
                    link.ContentDocumentId = insertedVersion.ContentDocumentId;
                    link.LinkedEntityId = attendance.Id;  // Link to the Attendance record
                    link.ShareType = 'V';  // View access
                    link.Visibility = 'AllUsers';  // Set the visibility
                    insert link;
                    System.debug('ContentDocumentLink created and linked to Attendance record.');
                    debugMessage += 'ContentDocumentLink created and linked to Attendance record \n';
                } else {
                    System.debug('Failed to retrieve ContentDocumentId from ContentVersion.');
                    throw new AuraHandledException('Failed to retrieve ContentDocumentId from ContentVersion.');
                }
            } else {
                System.debug('No image URL provided, skipping ContentVersion creation.');
            }

            System.debug('END: Attendance record and file creation completed successfully.');
            return debugMessage;
        } catch (Exception e) {
            System.debug('Error occurred: ' + e.getMessage());
            debugMessage += 'Error: ' + e.getMessage() + '\n';
            throw new AuraHandledException('An error occurred while creating the attendance record: ' + e.getMessage());
        }
    }
}
