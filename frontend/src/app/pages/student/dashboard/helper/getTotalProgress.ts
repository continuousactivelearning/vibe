import { CoursePctCompletion } from "@/types/course.types";


export const getTotalProgress = (completion:CoursePctCompletion[]) => 
    Math.round(
    completion.reduce((acc, curr) => acc + (curr.completedItems || 0), 0) / completion.reduce((acc, curr) => acc + (curr.totalItems || 0), 0) * 100
    ) || 0;
