Challenge

-   Implement a new gateway class  `BankTransferGateway`  that logs payment processing.
    
-   Use it with  `PaymentProcessor`  to process a payment.
    
-   Write a mock gateway that simulates failure (`return false`) and test error handling.
   ```typescript

class BankTransferGateway implements PaymentGateway {
  async processPayment(amount: number): Promise<boolean> {
    console.log(`Processing payment of $${amount} via Bank Transfer.`);
    return true;
  }
}

const bankGateway = new BankTransferGateway();
const processor = new PaymentProcessor(bankGateway);
processor.pay(300); // Logs Bank Transfer payment

// Mock failure gateway
class FailingGateway implements PaymentGateway {
  async processPayment(amount: number): Promise<boolean> {
    console.log(`Simulating failed payment of $${amount}.`);
    return false;
  }
}

const failGateway = new FailingGateway();
const failProcessor = new PaymentProcessor(failGateway);
failProcessor.pay(100); // Logs payment failed

   ```
-   This demonstrates how DI allows swapping implementations easily.
    
-   Business logic is  **decoupled**  from concrete gateway details.

