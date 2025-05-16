## Challenge 

-   Register a new  `APISource`  with the container.
    
-   Swap the implementation without changing aggregator code.
    
-   Write a test that injects a mock source.
    

## Solution & Deep Dive Explanation

   ```typescript
   @injectable()
class APISource implements NewsSource { /* ... */ }

container.rebind<NewsSource>(TYPES.NewsSource).to(APISource); // Swap implementation

const aggregator2 = container.resolve(NewsAggregator);
aggregator2.getLatestArticles(); // Now uses APISource

   ```

-   The aggregator code is unchanged; the container manages the swap.
