## Challenge

-   Create a  `BakingController`  for  `/baking`  routes.
    
-   Add a  `POST /baking/start`  endpoint to start baking an order.
    
-   Add a  `GET /baking/status/:id`  endpoint to check the baking status of an order.
    

##  Solution
  ```typescript
@JsonController("/baking")
export class BakingController {
  private bakingStatus: Record<string, string> = {};

  @Post("/start")
  startBaking(@Body() { orderId }: { orderId: string }) {
    this.bakingStatus[orderId] = "In Progress";
    return { status: "success", data: { orderId, status: "In Progress" } };
  }

  @Get("/status/:id")
  getStatus(@Param("id") id: string) {
    const status = this.bakingStatus[id] || "Not Started";
    return { status: "success", data: { orderId: id, status } };
  }
}

  ```


**Explanation:**

-   The  `BakingController`  keeps track of baking status for each order.
    
-   You can start baking and check the status by order ID.


