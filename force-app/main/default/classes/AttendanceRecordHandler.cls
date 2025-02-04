public with sharing class AttendanceRecordHandler {
    @AuraEnabled
    public static Id saveAttendanceRecord(String name, String employeeId, String description) {
        try {
            system.debug('description passed to the record creating class> '+description);
            // Create a new Attendance__c record
            Attendance__c attendance = new Attendance__c();
            attendance.Name = name;
            attendance.EmployeeId__c = employeeId;
            attendance.Description__c = description; // Save the same description

            insert attendance;

            // Return the attendance record ID
            return attendance.Id;
        } catch (Exception ex) {
            throw new AuraHandledException('Error while saving attendance record: ' + ex.getMessage());
        }
    }
}
