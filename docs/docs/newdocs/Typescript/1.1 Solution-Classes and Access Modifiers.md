## Challenge 


-   Create an  `Assignment`  class extending  `Content`.
    
-   Add a  `dueDate`  property (private).
    
-   Allow only instructors to set or update the due date before publishing.
    
-   Implement  `getType()`  returning  `"Assignment"`.
## Solution

   ```typescript
class Assignment extends Content {
  private dueDate: Date;

  constructor(title: string, author: string, dueDate: Date) {
    super(title, author);
    this.dueDate = dueDate;
  }

  public setDueDate(newDate: Date, isInstructor: boolean) {
    if (!this.isPublished() && isInstructor) {
      this.dueDate = newDate;
    } else {
      throw new Error("Cannot change due date after publishing or if not an instructor.");
    }
  }

  public getDueDate(): Date {
    return this.dueDate;
  }

  getType(): string {
    return "Assignment";
  }
}
   ```
-   Only instructors can change the due date, and only before publishing.
