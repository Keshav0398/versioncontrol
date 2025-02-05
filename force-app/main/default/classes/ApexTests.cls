@isTest
private with sharing class ApexTests 
{
    static testMethod void validateRegEx()
    {
        ApplyRegExToString.applyRegExRequest request = new ApplyRegExToString.applyRegExRequest();
        request.inputString = 'John is awesome!';
        request.pattern = 'John';
        request.replaceString = 'Chris';

        List<String> results = ApplyRegExToString.applyRegEx(new list<ApplyRegExToString.applyRegExRequest>{request});
        System.assertEquals(1, results.size());
        System.assertEquals('Chris is awesome!', results[0]);
    }

    static testMethod void validateOutputFlow()
    {
        GetFlowOutputValue.getFlowVarInput request = new GetFlowOutputValue.getFlowVarInput();
        request.inputJSON = '[{"name":"FirstName", "value":"Chris"},{"name":"LastName", "value":"Gilmore"},{"name":"DOB", "value":"2/9/1984"}]';
        request.varName = 'LastName';

        List<String> results = GetFlowOutputValue.getFlowOutput(new list<GetFlowOutputValue.getFlowVarInput>{request});
        System.assertEquals(1, results.size());
        System.assertEquals('Gilmore', results[0]);
    }

    public static void dev2Method() {
        System.debug('Developer 2 update');

    public static void dev1Method() {
        System.debug('Developer 1 update');
    }

    public static void dev1MethodNew() {
        System.debug('Developer 1 update');
    }

    public static void dev1demothWithoutPull() {
        System.debug('Developer 2 update');
    }
}
