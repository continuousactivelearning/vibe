
## Challenge

7.  Create a  `type`  called  `InstructorOrAdmin`  that can be either an  `Instructor`  or an  `Admin`.
    
8.  Given a type  `Assignment = { title: string; dueDate: Date; points: number; }`, create a type  `ReadonlyAssignment`  where none of the fields can be changed.
    
9.  Given a type  `LearnerStats = { quizzes: number; videos: number; assignments: number; }`, create a type  `StatsAsStrings`  that has the same keys, but all values are strings.
##  Solution 

## 1. Union Type
   ```typescript
type InstructorOrAdmin = Instructor | Admin;
 ```
## 2. Utility Type
   ```typescript
type Assignment = { title: string; dueDate: Date; points: number; };
type ReadonlyAssignment = Readonly<Assignment>;
 ```
## 3. Mapped Type
   ```typescript
type LearnerStats = { quizzes: number; videos: number; assignments: number; };
type StatsAsStrings = { [K in keyof LearnerStats]: string };
   ``` 


 

