 import { Loader2 } from 'lucide-react'
import React from 'react'
 
 function LoadingComponent() {
   
     return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading course data...</span>
          </div>
        </div>
      </div>
    )
   
 }
 
 export default LoadingComponent