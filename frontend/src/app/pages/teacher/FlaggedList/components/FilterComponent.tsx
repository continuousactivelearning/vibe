  
  import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from '@/components/ui/select';
import React from 'react'
import { EntityOptions, statusOptions } from '../constants/FlaggedConstants';
  
  function FilterComponent({selectedStatus, setSelectedStatus, selectedEntityType, setSelectedEntityType, setCurrentPage}:
    {selectedStatus: string, setSelectedStatus: (status: string) => void, selectedEntityType: string, setSelectedEntityType: (type: string) => void, setCurrentPage: (page: number) => void}) {
    return (
             <div className="flex items-center gap-4 mt-4">
  <label htmlFor="statusFilter" className="text-sm font-medium text-muted-foreground">Filter by Status:</label>
  <Select value={selectedStatus}  onValueChange={(value) => {
    setSelectedStatus(value);
    setCurrentPage(1); 
  }}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      {statusOptions.map((status:any) => (
        <SelectItem key={status} value={status}>
          {status === "ALL" ? "All Statuses" : status.replace("_", " ")}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <label htmlFor="statusFilter" className="text-sm font-medium text-muted-foreground">Filter by Type:</label>
  <Select value={selectedEntityType}  onValueChange={(value) => {
    setSelectedEntityType(value);
    setCurrentPage(1); 
  }}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
    <SelectContent>
      {EntityOptions.map((option) => (
        <SelectItem key={option} value={option}>
          {option === "ALL" ? "All Types" : option}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
       
    )
  }
  
  export default FilterComponent