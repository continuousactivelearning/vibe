## Challenge



-   Add a new route  `/contact`  in  `routes/contact.js`  that returns the center’s contact info as JSON.
    
-   Mount it in  `app.js`  at  `/contact`.
    
-   Test by visiting  `http://localhost:3000/contact`.
    

##  Solution

**routes/contact.js:**

 ```typescript
 const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    email: 'info@greenfieldcenter.org',
    phone: '555-123-4567'
  });
});

module.exports = router;

  ```

**app.js:**

 ```typescript
 const contactRouter = require('./routes/contact');
app.use('/contact', contactRouter);

  ```
  
**Explanation:**

-   Each route is in its own file, so you can add, update, or fix features without touching unrelated code.
    
-   `app.use()`  mounts each router at a specific path, keeping your app organized.


