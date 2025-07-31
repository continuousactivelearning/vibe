"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Filter, Calendar, User, BarChart3, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useCourseAnomalies, useUserAnomalies } from "@/hooks/hooks"
import type { AnomalyData } from "@/types/reportanomaly.types"

interface AnomalyAnalyticsProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  versionId: string
  studentEnrollments: any[] // Use any[] to match actual enrollment data structure
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function AnomalyAnalytics({ isOpen, onClose, courseId, versionId, studentEnrollments }: AnomalyAnalyticsProps) {
  // Filter states
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>("all")
  // const [selectedAnomalyTypeFilter, setSelectedAnomalyTypeFilter] = useState<string>("all")
  const [selectedTimeRangeFilter, setSelectedTimeRangeFilter] = useState<string>("all")

  // State to store organized student anomaly data
  const [allStudentAnomalies, setAllStudentAnomalies] = useState<{ [studentId: string]: AnomalyData[] }>({})

  // Fetch course anomalies (contains all student data)
  const { data: courseAnomalies, isLoading: courseAnomaliesLoading, error: courseAnomaliesError } = useCourseAnomalies(courseId, versionId)
  
  // Fetch individual student anomalies when a specific student is selected (for more detailed data if needed)
  const { data: userAnomalies, isLoading: userAnomaliesLoading, error: userAnomaliesError } = useUserAnomalies(
    courseId, 
    versionId, 
    selectedStudentFilter !== "all" ? selectedStudentFilter : ""
  )

  // Debug: Check if individual student anomalies are properly scoped
  useEffect(() => {
    if (selectedStudentFilter !== "all" && userAnomalies) {
      // console.log('=== Individual Student Anomalies Debug ===')
      // console.log('Selected student ID:', selectedStudentFilter)
      // console.log('Course ID:', courseId)
      // console.log('Version ID:', versionId)
      // console.log('User anomalies data:', userAnomalies)
      // console.log('User anomalies count:', userAnomalies.length)
      
      // Check if all anomalies belong to the current course/version
      const anomaliesFromOtherCourses = userAnomalies.filter(anomaly => 
        anomaly.courseId !== courseId || anomaly.versionId !== versionId
      )
      
      // if (anomaliesFromOtherCourses.length > 0) {
      //   // console.warn('Found anomalies from other courses/versions:', anomaliesFromOtherCourses)
      // } else {
      //   console.log('All anomalies are correctly scoped to current course/version')
      // }
    }
  }, [selectedStudentFilter, userAnomalies, courseId, versionId])



  // Organize course anomalies by student when data is available
  useEffect(() => {
    if (!courseAnomalies || !Array.isArray(courseAnomalies)) {
      setAllStudentAnomalies({})
      return
    }

    const organizedData: { [studentId: string]: AnomalyData[] } = {}
    
    // Group anomalies by student ID
    courseAnomalies.forEach(anomaly => {
      const studentId = anomaly.userId // This should match the user.userId from enrollment data
      if (!organizedData[studentId]) {
        organizedData[studentId] = []
      }
      organizedData[studentId].push(anomaly)
    })
    
    setAllStudentAnomalies(organizedData)
  }, [courseAnomalies])

  // Determine which data to use and loading state
  const getCurrentAnomalies = (): AnomalyData[] => {
    if (selectedStudentFilter === "all") {
      return courseAnomalies || []
    } else {
      // Use individual student data if available, otherwise use organized course data
      let individualData = userAnomalies || allStudentAnomalies[selectedStudentFilter] || []
      
      // Filter to ensure we only show anomalies for the current course and version
      individualData = individualData.filter(anomaly => {
        // Check if anomaly belongs to current course and version
        const belongsToCurrentCourse = !anomaly.courseId || anomaly.courseId === courseId
        const belongsToCurrentVersion = !anomaly.versionId || anomaly.versionId === versionId
        
        if (!belongsToCurrentCourse || !belongsToCurrentVersion) {
          console.warn('Filtering out anomaly from different course/version:', {
            anomaly,
            currentCourseId: courseId,
            currentVersionId: versionId
          })
        }
        
        return belongsToCurrentCourse && belongsToCurrentVersion
      })
      
      return individualData
    }
  }
  
  const currentAnomalies = getCurrentAnomalies()
  const isLoading = selectedStudentFilter === "all" ? courseAnomaliesLoading : userAnomaliesLoading
  const error = selectedStudentFilter === "all" ? courseAnomaliesError : userAnomaliesError
  


  // Get filtered anomalies
  const getFilteredAnomalies = () => {
    if (!currentAnomalies || !Array.isArray(currentAnomalies)) {
      return []
    }
    
    let filtered = [...currentAnomalies]
    
    // Note: Student filtering is now handled by the hook selection above
    // No need to filter by student here since we're using different hooks
    
    // Filter by anomaly type
    // if (selectedAnomalyTypeFilter !== "all") {
    //   filtered = filtered.filter(anomaly => anomaly.type === selectedAnomalyTypeFilter)
    // }
    
    // Filter by time range
    if (selectedTimeRangeFilter !== "all") {
      const now = new Date()
      let cutoffDate: Date
      
      switch (selectedTimeRangeFilter) {
        case "today":
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        default:
          cutoffDate = new Date(0)
      }
      
      // console.log('Cutoff date:', cutoffDate)
      const beforeTimeFilter = filtered.length
      filtered = filtered.filter(anomaly => {
        const anomalyDate = new Date(anomaly.createdAt)
        const matches = anomalyDate >= cutoffDate
        if (!matches) {
          // console.log('Time filter mismatch:', anomalyDate, 'vs', cutoffDate)
        }
        return matches
      })
    }
    
    return filtered
  }

  // Get anomaly type data for pie chart
  const getAnomalyTypeData = () => {
    const filteredAnomalies = getFilteredAnomalies()
    const typeCounts: { [key: string]: number } = {}
    
    filteredAnomalies.forEach(anomaly => {
      const type = anomaly.type || 'Unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
  }

  // Get anomaly timeline data
  const getAnomalyTimelineData = () => {
    const filtered = getFilteredAnomalies()
    const timelineData: { [date: string]: number } = {}
    
    filtered.forEach(anomaly => {
      const date = new Date(anomaly.createdAt).toLocaleDateString()
      timelineData[date] = (timelineData[date] || 0) + 1
    })
    
    return Object.entries(timelineData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get anomaly type timeline data with student count for bar click
  // const getAnomalyTypeTimelineData = () => {
  //   if (selectedAnomalyTypeFilter === "all") return []
  //   
  //   const filtered = getFilteredAnomalies().filter(anomaly => anomaly.type === selectedAnomalyTypeFilter)
  //   const timelineData: { [date: string]: { count: number, students: Set<string> } } = {}
  //   
  //   filtered.forEach(anomaly => {
  //     const date = new Date(anomaly.createdAt).toLocaleDateString()
  //     if (!timelineData[date]) {
  //       timelineData[date] = { count: 0, students: new Set() }
  //     }
  //     timelineData[date].count += 1
  //     timelineData[date].students.add(anomaly.userId)
  //   })
  //   
  //   return Object.entries(timelineData)
  //     .map(([date, data]) => ({ 
  //       date, 
  //       count: data.count, 
  //       studentCount: data.students.size,
  //       students: Array.from(data.students)
  //     }))
  //     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  // }

  // Handle bar click to show student count
  // const handleAnomalyTypeBarClick = (data: any) => {
  //   if (data && data.payload) {
  //     const { date, count, studentCount, students } = data.payload
  //     alert(`Date: ${date}\nAnomalies: ${count}\nStudents Affected: ${studentCount}\nStudent IDs: ${students.join(', ')}`)
  //   }
  // }

  // Get student anomaly data for bar chart
  const getStudentAnomalyData = () => {
    // Only show this chart when viewing all students
    if (selectedStudentFilter !== "all") {
      return []
    }
    
    const filteredAnomalies = getFilteredAnomalies()
    const studentCounts: { [key: string]: number } = {}
    
    filteredAnomalies.forEach(anomaly => {
      const studentId = anomaly.userId
      studentCounts[studentId] = (studentCounts[studentId] || 0) + 1
    })
    
    return Object.entries(studentCounts)
      .map(([studentId, count]) => {
        const enrollment = studentEnrollments.find(s => s.user.userId === studentId) // Updated to use user.userId
        let studentName = 'Unknown'
        
        if (enrollment && enrollment.user) {
          const firstName = enrollment.user.firstName || ''
          const lastName = enrollment.user.lastName || ''
          const fullName = `${firstName} ${lastName}`.trim()
          
          if (fullName) {
            studentName = fullName
          } else if (enrollment.user.email) {
            studentName = enrollment.user.email.split('@')[0]
          } else {
            studentName = `Student ${studentId.slice(-4)}`
          }
        } else {
          studentName = `Student ${studentId.slice(-4)}`
        }
        
        return {
          name: studentName,
          value: count,
          fullName: studentName
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 students
  }

  // Get unique students for filter (only students, not instructors)
  const uniqueStudents = studentEnrollments
    .filter(enrollment => enrollment.role === "STUDENT") // Only include students
    .map(enrollment => ({
      id: enrollment.user.userId, // Correct field name is user.userId
      name: `${enrollment.user?.firstName || ''} ${enrollment.user?.lastName || ''}`.trim() || enrollment.user?.email?.split('@')[0] || 'Unknown'
    }))

  // Reset filters when student selection changes
  const handleStudentFilterChange = (value: string) => {
    setSelectedStudentFilter(value)
    // Reset other filters when switching between all students and specific student
    // setSelectedAnomalyTypeFilter("all")
    setSelectedTimeRangeFilter("all")
  }

  // Get selected student name for display
  const getSelectedStudentName = () => {
    if (selectedStudentFilter === "all") {
      return "All Students"
    }
    const student = uniqueStudents.find(s => s.id === selectedStudentFilter)
    return student ? student.name : "Unknown Student"
  }

  // Get anomaly type display name
  const getAnomalyTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'no_face': 'No Face Detected',
      'multiple_faces': 'Multiple Faces',
      'blurDetection': 'Blur Detection'
    }
    return typeMap[type] || type
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Anomaly Analytics Dashboard
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze and monitor anomaly patterns in your course
          </p>
        </DialogHeader>

        {/* Filters Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student View
                </Label>
                <Select value={selectedStudentFilter} onValueChange={handleStudentFilterChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select student view">
                      {selectedStudentFilter === "all" 
                        ? "All Students" 
                        : uniqueStudents.find(s => s.id === selectedStudentFilter)?.name || "Select student"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] max-w-[300px]">
                    <SelectItem value="all">All Students</SelectItem>
                    {uniqueStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        <span className="truncate">{student.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Anomaly Type
                </Label>
                <Select value={selectedAnomalyTypeFilter} onValueChange={setSelectedAnomalyTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select anomaly type">
                      {selectedAnomalyTypeFilter === "all" 
                        ? "All Types" 
                        : getAnomalyTypeDisplayName(selectedAnomalyTypeFilter)
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[250px]">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="no_face">No Face Detected</SelectItem>
                    <SelectItem value="multiple_faces">Multiple Faces</SelectItem>
                    <SelectItem value="blurDetection">Blur Detection</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Time Range
                </Label>
                <Select value={selectedTimeRangeFilter} onValueChange={setSelectedTimeRangeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time range">
                      {selectedTimeRangeFilter === "all" ? "All Time" : 
                       selectedTimeRangeFilter === "today" ? "Today" :
                       selectedTimeRangeFilter === "week" ? "Last 7 Days" :
                       selectedTimeRangeFilter === "month" ? "Last 30 Days" : "All Time"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[200px]">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current filters summary */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <span className="font-medium">Current View:</span>
                <div className="flex-1 text-muted-foreground break-words">
                  <span className="inline-block">
                    {selectedStudentFilter === "all" ? "All Students" : uniqueStudents.find(s => s.id === selectedStudentFilter)?.name || "Unknown"}
                  </span>
                  <span className="mx-1">•</span>
                  {/* <span className="inline-block">
                    {selectedAnomalyTypeFilter === "all" ? "All Types" : getAnomalyTypeDisplayName(selectedAnomalyTypeFilter)}
                  </span> */}
                  {/* <span className="mx-1">•</span> */}
                  <span className="inline-block">
                    {selectedTimeRangeFilter === "all" ? "All Time" : 
                     selectedTimeRangeFilter === "today" ? "Today" : 
                     selectedTimeRangeFilter === "week" ? "Last 7 Days" : 
                     selectedTimeRangeFilter === "month" ? "Last 30 Days" : "All Time"}
                  </span>
                </div>
                <span className="font-medium text-primary whitespace-nowrap">
                  {getFilteredAnomalies().length} anomalies found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Anomaly Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Anomaly Distribution
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Breakdown of anomaly types detected
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : getAnomalyTypeData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getAnomalyTypeData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => `${getAnomalyTypeDisplayName(name)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getAnomalyTypeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, getAnomalyTypeDisplayName(name as string)]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No data available</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Chart - Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Anomaly Trends
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Daily occurrence patterns over time
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : getAnomalyTimelineData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getAnomalyTimelineData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        className="text-muted-foreground"
                      />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip 
                        formatter={(value) => [value, 'Anomalies']}
                        labelFormatter={(date) => `Date: ${date}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No timeline data available</p>
                    <p className="text-sm text-muted-foreground">Try selecting a different time range</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart - Students (only show when viewing all students) */}
          {selectedStudentFilter === "all" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Top Students by Anomaly Count
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Students with the most detected anomalies (top 5)
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : getStudentAnomalyData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getStudentAnomalyData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 9, width: 100 }}
                        angle={-30}
                        textAnchor="end"
                        height={100}
                        className="text-muted-foreground"
                        interval={0}
                        tickFormatter={(value) => {
                          // Truncate long names to fit better
                          return value.length > 15 ? value.substring(0, 12) + '...' : value
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip 
                        formatter={(value) => [value, 'Anomalies']}
                        labelFormatter={(name) => `Student: ${name}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No student data available</p>
                    <p className="text-sm text-muted-foreground">No anomalies found for current filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Error loading anomaly data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}