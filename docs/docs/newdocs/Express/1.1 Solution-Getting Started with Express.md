
## Challenge


-   Add a new route  `/contact`  that returns the center’s contact email and phone as a JSON object.
    
-   Test it by visiting  `http://localhost:3000/contact`.
    

##  Solution 

 ```typescript
 app.get('/contact', (req, res) => {
  res.json({
    email: 'info@greenfieldcenter.org',
    phone: '555-123-4567'
  });
});
  ```


**Explanation:**

-   `res.json()`  sends a structured response, perfect for web apps or mobile clients.
    
-   You can now add as many information endpoints as the community needs.


