public with sharing class OrderCreationHelper {

    @InvocableMethod(
        label = 'Create Order and Order Items'
        description = 'Create an Order and associated Order Items based on provided product details.'
    )
    public static List<OrderCreationResponse> createOrder(List<OrderCreationRequest> requests) {
        // List to store responses
        List<OrderCreationResponse> responses = new List<OrderCreationResponse>();

        // Loop through each request
        for (OrderCreationRequest request : requests) {
            try {
                // Query the Product2 record based on product name
                Product2 product = [
                    SELECT Id FROM Product2 WHERE Name = :request.productName LIMIT 1
                ];

                // Query the PricebookEntry record for the product
                PricebookEntry pricebookEntry = [
                    SELECT Id, Pricebook2Id, UnitPrice 
                    FROM PricebookEntry 
                    WHERE Product2Id = :product.Id 
                    LIMIT 1
                ];

                // Create the Order record
                Order newOrder = new Order(
                    AccountId = '001aj00000lB9zNAAS',
                    EffectiveDate = system.today(),
                    Pricebook2Id = pricebookEntry.Pricebook2Id,
                    Status = 'Draft',
                    ContractId = '800aj00000YPC0nAAH'
                );
                insert newOrder;

                // Create the OrderItem record
                OrderItem orderItem = new OrderItem(
                    OrderId = newOrder.Id,
                    PricebookEntryId = pricebookEntry.Id,
                    Product2Id = product.Id,
                    Quantity = request.quantity,
                    UnitPrice = pricebookEntry.UnitPrice
                );
                insert orderItem;

                // Prepare the response
                OrderCreationResponse response = new OrderCreationResponse();
                response.orderId = newOrder.Id;
                response.orderItemId = orderItem.Id;
                response.successMessage = 'Order and Order Item created successfully.';
                responses.add(response);
            } catch (Exception e) {
                // Handle errors and create a response
                OrderCreationResponse response = new OrderCreationResponse();
                response.orderId = null;
                response.orderItemId = null;
                response.errorMessage = 'Error: ' + e.getMessage();
                responses.add(response);
            }
        }

        return responses;
    }

    // Request Class
    public class OrderCreationRequest {
        @InvocableVariable(
            required = true
            description = 'The Account ID for which the order is created.'
        )
        public Id accountId;

        @InvocableVariable(
            required = true
            description = 'The product name to create the order for.'
        )
        public String productName;

        @InvocableVariable(
            required = true
            description = 'The quantity of the product for the order.'
        )
        public Decimal quantity;

        @InvocableVariable(
            required = true
            description = 'The effective date of the order.'
        )
        public Date effectiveDate;
    }

    // Response Class
    public class OrderCreationResponse {
        @InvocableVariable(
            description = 'The ID of the created Order.'
        )
        public Id orderId;

        @InvocableVariable(
            description = 'The ID of the created Order Item.'
        )
        public Id orderItemId;

        @InvocableVariable(
            description = 'Success message if the operation succeeded.'
        )
        public String successMessage;

        @InvocableVariable(
            description = 'Error message if the operation failed.'
        )
        public String errorMessage;
    }
}