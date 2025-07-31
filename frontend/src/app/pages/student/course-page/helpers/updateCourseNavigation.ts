import { useCourseStore } from "@/store/course-store";
import { CourseInfo } from "@/types/course.types";

export function updateCourseNavigation(
  moduleId: string,
  sectionId: string,
  itemId: string,
  setCurrentCourse: (course:CourseInfo) => void 
) {
  const currentCourse = useCourseStore.getState().currentCourse;

  if (currentCourse) {
    setCurrentCourse({
      ...currentCourse,
      moduleId,
      sectionId,
      itemId,
    });
  }
}
