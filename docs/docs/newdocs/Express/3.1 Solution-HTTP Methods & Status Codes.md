


## Challenge


-   Add a PATCH endpoint  `/products/:id/inStock`  to update only the  `inStock`  status of a product.
    
-   Return  `400 Bad Request`  if the new status is missing or not a boolean.
    

## Solution 
 ```typescript
router.patch("/:id/inStock", (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  const { inStock } = req.body;
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  if (typeof inStock !== "boolean") {
    return res.status(400).json({ error: "Invalid inStock status" });
  }
  product.inStock = inStock;
  res.status(200).json(product);
});

 ```
**Explanation:**

-   PATCH is used for partial updates.
    
-   Checks for valid product and valid boolean status.
    
-   Returns clear status codes and messages.
    


