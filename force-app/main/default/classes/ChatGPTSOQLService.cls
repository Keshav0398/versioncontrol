public without sharing class ChatGPTSOQLService {
    
    
    private static final String API_KEY = 'sk-proj-qqR7Kq31TvUWSl9fGqpWT3BlbkFJGAgoWQfdBhB4U6C48dmF'; // Replace with your actual API key
    private static final String ENDPOINT_URL = 'https://api.openai.com/v1/chat/completions';
	@AuraEnabled
    public static String processVoiceInput(String userInput) {
        // Call ChatGPT and process the response
        // Example logic to return a simple response
        system.debug('userInput---------------->'+userInput);
        String response = processUserQuery(userInput);
        system.debug('response from calChateGPT class'+response);
        return response;
    }




    // Method to process user query and return results
    public static String processUserQuery(String userQuery) {
        String prompt = 'You are a helpful assistant. Given the user query, generate a SOQL query and a response prefix in JSON format. \n\n'
                        + 'User Query: ' + userQuery + '\n\n'
                        + 'Response Format:\n'
                        + '{\n'
                        + '  "SOQL": "The SOQL query to execute",\n'
                        + '  "prefix": "The prefix message for the result"\n'
                        + '}\n\n'
                        + 'Example:\n'
                        + '{\n'
                        + '  "SOQL": "SELECT COUNT(Id) FROM Opportunity",\n'
                        + '  "prefix": "Your total number of opportunities is "\n'
                        + '}';

        String responseString = callChatGPT(prompt);

        // Log the response for debugging
        System.debug('API Response Body: ' + responseString);

        // Convert the JSON response to a Map
        Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(responseString);

        // Extract SOQL query and prefix message from response
        String soqlQuery = (String)responseMap.get('SOQL');
        String prefixMessage = (String)responseMap.get('prefix');
        system.debug('prefixMessage-------->'+prefixMessage);

        // Execute SOQL query and format result
        String resultMessage = executeSOQLQuery(soqlQuery);
        //String finalOutput = prefixMessage + resultMessage;
        String finalOutput = 'SOQL: ' + soqlQuery + '\n' + prefixMessage + resultMessage;
        system.debug('finalOutput--------->'+finalOutput);

        return finalOutput;
    }

    /**
     * @description Method to call ChatGPT and get a response
     */
    private static String callChatGPT(String prompt) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(ENDPOINT_URL);
        req.setMethod('POST');
        req.setTimeout(1000*120);
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Authorization', 'Bearer ' + API_KEY);

        Map<String, Object> promptBody = new Map<String, Object>{
            'role' => 'user',
            'content' => prompt
        };

        List<Object> lstPrompts = new List<Object>();
        lstPrompts.add(promptBody);

        Map<String, Object> requestBody = new Map<String, Object>{
            'messages' => lstPrompts,
            'model' => 'gpt-3.5-turbo'
        };

        req.setBody(JSON.serialize(requestBody));

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseBody = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
            List<Object> choices = (List<Object>)responseBody.get('choices');
            if (choices.size() > 0) {
                Map<String, Object> choice = (Map<String, Object>)choices.get(0);
                Map<String, Object> message = (Map<String, Object>)choice.get('message');
                String responseText = (String)message.get('content');

                responseText = responseText != null ? responseText.trim() : '';
                system.debug(responseText);
                return responseText;
            }
        } else {
            throw new ChatGPTException('Error: Unable to generate response from ChatGPT. Status Code: ' + res.getStatusCode());
        }

        return '';
    }

    /**
     * @description Method to execute SOQL query and return result
     */
    private static String executeSOQLQuery(String soqlQuery) {
    if (String.isEmpty(soqlQuery)) {
        return 'No SOQL query provided.';
    }

    try {
        // Determine if the query is an aggregate query
        if (soqlQuery.toUpperCase().contains('COUNT')) {
            List<AggregateResult> results = Database.query(soqlQuery);
            if (results.size() > 0) {
                AggregateResult result = results[0];
                // Extract the aggregate result value (e.g., COUNT)
                Object count = result.get('expr0');
                system.debug('SOQL ------->'+soqlQuery);
                return String.valueOf(count);
            } else {
                return 'No results returned.';
            }
        } else {
            // Handle standard queries
            List<SObject> results = Database.query(soqlQuery);
            if (results.size() > 0) {
                // For simplicity, returning the first result's string field
                // Modify as needed to handle specific fields or data types
                SObject firstResult = results[0];
                // Extract a string field from the result (e.g., Name, or any other relevant field)
                String fieldValue = (String)firstResult.get('Name'); // Modify field as needed
                system.debug('SOQL ------->'+soqlQuery);
                return fieldValue != null ? fieldValue : 'Field value is null.';
            } else {
                return 'No results returned.';
            }
        }
    } catch (Exception e) {
        return 'Error executing SOQL query: ' + e.getMessage();
    }
}


    /**
     * @description Custom exception class
     */
    public class ChatGPTException extends Exception {}
    
    
}