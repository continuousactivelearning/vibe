"use client"

import * as React from "react"
import {
  BookOpen,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  Search,
  Settings2,
  Users,
  CalendarDays,
  MessageSquare,
  FileText,
  Clock,
  BookMarked
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar"

// This is teacher-specific data
const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/avatars/teacher.jpg",
  },
  teams: [
    {
      name: "Vibe Learning",
      logo: GraduationCap,
      plan: "Educator",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/teacher/dashboard",
      icon: LayoutDashboard,
      isActive: true,

    },
    {
      title: "Courses",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "All Courses",
          url: "/teacher/courses",
        },
        {
          title: "Create Course",
          url: "/teacher/courses/create",
        },
        {
          title: "Manage Content",
          url: "/teacher/courses/manage",
        },
      ],
    },
    {
      title: "Students",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Students",
          url: "/teacher/students",
        },
        {
          title: "Performance",
          url: "/teacher/students/performance",
        },
        {
          title: "Engagement",
          url: "/teacher/students/engagement",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: LineChart,
      items: [
        {
          title: "Dashboard",
          url: "/teacher/analytics",
        },
        {
          title: "Reports",
          url: "/teacher/analytics/reports",
        },
      ],
    },
    {
      title: "Schedule",
      url: "#",
      icon: CalendarDays,
      items: [
        {
          title: "Calendar",
          url: "/teacher/schedule/calendar",
        },
        {
          title: "Appointments",
          url: "/teacher/schedule/appointments",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      icon: BookMarked,
      items: [
        {
          title: "Library",
          url: "/teacher/resources/library",
        },
        {
          title: "My Resources",
          url: "/teacher/resources/my-resources",
        },
      ],
    },
    {
      type: "separator" as const, // Use 'as const' to make this a literal type
    },
    {
      title: "Messages",
      url: "/teacher/messages",
      icon: MessageSquare,
      isCollapsible: false,
    },
    {
      title: "Settings",
      url: "/teacher/settings",
      icon: Settings2,
      isCollapsible: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
