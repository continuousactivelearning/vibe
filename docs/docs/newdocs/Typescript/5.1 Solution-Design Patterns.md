


## Challenge 

-   Implement a  `PromotionSystem`  observer that announces special offers to customers when a drink is served.
    
-   Add it to the  `DrinkOrder`  notification list and test it.
## Solution 
   ```typescript
class PromotionSystem implements Observer {
  update(message: string) {
    console.log("Promotion announced:", message, "Enjoy a discount on your next order!");
  }
}

const order2 = new DrinkOrder();
order2.addObserver(new InventorySystem());
order2.addObserver(new Barista());
order2.addObserver(new Customer());
order2.addObserver(new PromotionSystem());

const drink3 = DrinkFactory.createDrink("latte");
order2.completeOrder(drink3);
// Output includes: Promotion announced: Order complete! Enjoy a discount on your next order!
   ```
