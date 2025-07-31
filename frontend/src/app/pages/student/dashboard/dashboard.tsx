import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUserEnrollments, useWatchtimeTotal } from "@/hooks/hooks";
import { useNavigate } from "@tanstack/react-router";
import { StatCard } from "@/components/ui/StatCard";
import { AnnouncementBanner } from "@/components/ui/AnnouncementBanner";
import { CourseSection } from "@/components/course/CourseSection";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getGreeting } from "@/utils/helpers";
import type { CoursePctCompletion } from '@/types/course.types';
import { AuthStateHandler } from "./components/AuthStateHandler";
import { UserStats } from "./components/UserStats";
import { getTotalProgress } from "./helper/getTotalProgress";

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to auth page if not logged in yet
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to auth page");
      navigate({ to: '/auth' });
    }
  }, [isAuthenticated, navigate]);

 return !isAuthenticated ? 
        <AuthStateHandler 
          isAuthenticated={isAuthenticated}
        /> :
        <DashboardContent/>
}


function DashboardContent() {

  // << Store >> 
  const { token, user } = useAuthStore();

  // Greeting state & updater
  const [greeting, setGreeting] = useState(getGreeting());

  const navigate = useNavigate();
  const studentName = user?.name || 'Student';

  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    error: enrollmentsError
  } = useUserEnrollments(1, 5, !!token);

  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(intervalId);

  }, []);

  const enrollments = enrollmentsData?.enrollments || [];
  const totalEnrollments = enrollmentsData?.totalDocuments || 0;
  const { data: watchtimeData } = useWatchtimeTotal();
  const filteredEnrollement = enrollments.filter(enrollment=>enrollment.role == "STUDENT");
  const [completion, setCompletion] = useState<CoursePctCompletion[]>([]);
  const totalProgress = getTotalProgress(completion);
  
  return (
    <>
      {/* Greeting and Stat Cards in two separate flex boxes */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 px-4 sm:px-6 lg:px-8 xl:px-0 gap-6 transition-all duration-300">
        {/* Left: Greeting Box */}
        <div className="flex-1 bg-background rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-1">
            {greeting}, {studentName} 👋
          </h1>
          <p className="text-muted-foreground">
            Welcome to your learning dashboard, check your priority learning.
          </p>
        </div>
        {/* Right: Stat Cards */}
        <UserStats 
          totalEnrollments={totalEnrollments}
          watchtimeData={watchtimeData}
          totalProgress={totalProgress}
        />
      </div>
      {/* Announcement Banner */}
      <div className="mb-2 px-4 sm:px-6 lg:px-8 xl:px-0 transition-all duration-300">
        <AnnouncementBanner
          title="Achievement Unlocked!"
          description="Congratulations! You've earned the 'Quick Learner' badge by completing 5 lessons in a single day."
        />
      </div>
      {/* Main content and sidebar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 py-6 flex flex-col md:flex-row gap-6 transition-all duration-300">
        <main className="flex-1">
          <CourseSection
            title="In progress learning content"
            enrollments={filteredEnrollement}
            isLoading={enrollmentsLoading}
            error={enrollmentsError}
            totalEnrollments={totalEnrollments}
            showViewAll
            onViewAll={() => navigate({ to: '/student/courses' })}
            onRetry={() => window.location.reload()}
            variant="dashboard"
            emptyStateConfig={{
              title: "No courses enrolled yet",
              description: "Start your learning journey by enrolling in a course",
              actionText: "Browse Courses",
              onAction: () => navigate({ to: '/student/courses' }),
            }}
            completion={completion}
            setCompletion={setCompletion}
            className="mb-8"
          />
          <CourseSection
            title="Recommended for you"
            enrollments={[]}
            isLoading={false}
            showViewAll
            onViewAll={() => navigate({ to: '/student/courses' })}
            variant="dashboard"
            emptyStateConfig={{
              title: "Discover new courses",
              description: "Explore our course catalog to find your next learning adventure",
              actionText: "Browse All Courses",
              onAction: () => navigate({ to: '/student/courses' })
            }}
          />
        </main>
        <aside className="w-full md:w-80">
          <div className="sticky top-6">
            <DashboardSidebar enrollments={filteredEnrollement} />
          </div>
        </aside>
      </div>
    </>
  );
}
