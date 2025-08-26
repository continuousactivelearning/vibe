


## Challenge 


-   Add a validation rule that requires a “portfolioLink” field to be a valid URL (for art applicants).
    
-   If missing or invalid, return an error message: “A valid portfolio link is required for art applicants.”
    

## Solution


**Usage in the validation array:**
 ```typescript 
body("portfolioLink")
  .optional({ nullable: true })
  .isURL()
  .withMessage("A valid portfolio link is required for art applicants"),
 ```

**Explanation:**
 ```typescript 
const applicationValidation = [
  // ...other rules...
  body("portfolioLink")
    .optional({ nullable: true })
    .isURL()
    .withMessage("A valid portfolio link is required for art applicants"),
];
 ```
-   `.optional({ nullable: true })`  means the field is only required for certain applicants.
    
-   `.isURL()`  ensures the link is real.
    
-   The error message is specific and actionable.
