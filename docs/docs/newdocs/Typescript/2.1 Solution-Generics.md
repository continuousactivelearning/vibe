## Challenge


1.  Write a generic class  `FeedbackBox<T>`  that stores feedback items of any type and lets you retrieve them all.
    
2.  Write a generic function  `getFirstItem<T>`  that returns the first item from any array.


## Solution 

## 1. FeedbackBox Solution

   ```typescript

class FeedbackBox<T> {
  private feedbacks: T[] = [];

  addFeedback(feedback: T) {
    this.feedbacks.push(feedback);
  }

  getAllFeedback(): T[] {
    return [...this.feedbacks];
  }
}
   ```


## 2. getFirstItem Solution

   ```typescript

function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}

   ```
