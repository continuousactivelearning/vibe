import { RouteObject } from "react-router-dom";
import StudentLayout from "@/layouts/student-layout";
import StudentDashboard from "@/app/pages/student/dashboard/dashboard";
import StudentCourses from "@/app/pages/student/course/courses";
import StudentProfile from "@/app/pages/student/profile/profile";
import CoursePage from "@/app/pages/student/course-page/course-page";

export const studentRoutes: RouteObject = {
  path: "/student",
  element: <StudentLayout />,
  children: [
    {
      path: "dashboard",
      element: <StudentDashboard />,
    },
    {
      path: "courses",
      element: <StudentCourses />,
    },
    {
      path: "profile",
      element: <StudentProfile />,
    },
    {
      index: true,
      element: <StudentDashboard />, // Default to Dashboard
    }
  ],
};

export const learnRoutes: RouteObject = {
  path: "student/learn",
  element: <CoursePage />
};


