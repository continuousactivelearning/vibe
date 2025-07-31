"use client"

import { useState, useEffect } from "react"
import {  useNavigate } from "@tanstack/react-router"
import { Users} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

// Import hooks - including the new quiz hooks
import {
  useGetReports,
   useCourseById,
  useCourseVersionById,
   useUpdateReportStatus,
  useGetReportDetails
} from "@/hooks/hooks"
import { useFlagStore } from "@/store/flag-store"
import { useQueryClient } from "@tanstack/react-query"
import { FlagModal } from "@/components/FlagModal"
import { ReportStatus } from "@/types/reports.types";
import { toast } from "sonner"
import { Pagination } from "@/components/ui/Pagination"
import ErrorComponent from "./components/ErrorComponent"
import LoadingComponent from "./components/LoadingComponent"
import Header from "./components/Header"
import FilterComponent from "./components/FilterComponent"
import FlaggedTableComponent from "./components/FlaggedTableComponent"
import { handlePageChange, handleSort } from "./helpers/FlaggedListHelpers"


export default function FlaggedList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()


const pageLimit=10;

 const [selectedStatus, setSelectedStatus] = useState("ALL");
 const [selectedEntityType, setSelectedEntityType] = useState("ALL");
  
  // Get course info from store
  const { currentCourseFlag } = useFlagStore()
  const courseId = currentCourseFlag?.courseId
  const versionId = currentCourseFlag?.versionId
  
  if (!currentCourseFlag || !courseId || !versionId) {
    navigate({ to: '/teacher/courses/list' });
    return null
  }
 const [currentPage, setCurrentPage] = useState(1)
  // Fetch reports based on course id and version id
  const { data: flagsData, isLoading: reportLoading, error: reportError } = useGetReports(courseId || "",versionId || "",pageLimit,currentPage,selectedStatus,selectedEntityType)
  
  const { data: course, isLoading: courseLoading, error: courseError } = useCourseById(courseId || "")
  const { data: version, isLoading: versionLoading, error: versionError } = useCourseVersionById(versionId || "")
  const {
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset
  } = useUpdateReportStatus();



  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false)

const [selectedReport, setSelectedReport] = useState<{ id: string; status: string } | null>(null);
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
const { data: selectedFlagData, error: selectedFlagError } = useGetReportDetails(selectedReport?.id);

  // Show all reports regardless 

  const reports = flagsData?.reports || []

  const totalDocuments =flagsData?.totalDocuments || 0
  const totalPages = flagsData?.totalPages || 1

  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'enrollmentDate' | 'progress'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')






 // Flag handling function
 const handleStatusUpdate = async (comment: string, status: ReportStatus) => {
  if (!selectedReport) {
    console.warn("Reported data is not defined", selectedReport);
    return;
  }
  try {
    await mutateAsync({
      params: {
        path: {
          reportId: selectedReport.id,
        },
      },
      body: {
        status,
        comment,
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['get', '/reports/{courseId}/{versionId}'] }),
      queryClient.invalidateQueries({ queryKey: ['get', '/reports/{reportId}'] }),
    ]);
    
    toast.success("Status updated successfully");
  } catch (error) {
    toast.error("Failed to update status");
    console.error("Error while updating report status:", error);
  } finally {
    setUpdateStatusModalOpen(false);
    setSelectedReport(null)
    setIsUpdatingStatus(false)
  }
};


  // Loading state
  if (courseLoading  ||  reportLoading) {
    <LoadingComponent />
  }

  // Error state
  if (courseError || reportError || !course || !version) {
    return (
      <ErrorComponent error={courseError || reportError || ""}/>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        
           <Header course={course} version={version} />
 <FilterComponent selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
    selectedEntityType={selectedEntityType} setSelectedEntityType={setSelectedEntityType} setCurrentPage={setCurrentPage} />
               {/* Flags Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-foreground text-xl font-semibold mb-2">No Flags found</p>
                <p className="text-muted-foreground">
                  { "No students have reported this entity in this course version"}
                </p>
              </div>
            ) : (
             <FlaggedTableComponent handleSort={()=>{}} reports={reports} sortBy={sortBy} sortOrder={sortOrder} setSelectedReport={setSelectedReport} selectedReport={selectedReport} setIsUpdatingStatus={setIsUpdatingStatus} setUpdateStatusModalOpen={setUpdateStatusModalOpen} selectedFlagData={selectedFlagData} />
            )}
          </CardContent>
        </Card>
        {selectedReport?.id && 
     <FlagModal
     open={updateStatusModalOpen}
     onOpenChange={(isOpen) => {
      setUpdateStatusModalOpen(isOpen);
      if (!isOpen) {
        setIsUpdatingStatus(false); 
        setSelectedReport(null);
      }}}
     onSubmit={handleStatusUpdate}
     isSubmitting={false}
     teacher={true}
     selectedStatus={selectedReport?.status}
     
     />
    }
                {totalPages > 1 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalDocuments={totalDocuments}
                            onPageChange={handlePageChange}
                          />
                        )}
      </div>
    </div>

    
  )
}
