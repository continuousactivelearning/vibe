## Challenge 

-   Write a  `@Audit`  class decorator that logs when a drone instance is created.
    
-   Apply it to a new  `AuditDrone`  class.
    

## Solution 
   ```typescript
function Audit<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      console.log(`[AUDIT] Drone created with ID: ${args[0]}`);
    }
  };
}

@Audit
class AuditDrone extends Drone {
  // Inherits everything from Drone
}




   ```


-   The  `@Audit`  decorator adds a sticker to the class itself, logging creation events.



