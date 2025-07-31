 
 import React from 'react'
 
 function ErrorComponent({error=''}: {error: string}) {
   return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load course data</h3>
            <p className="text-muted-foreground mb-4">
              {error || "Course or version not found"}
            </p>
          </div>
        </div>
      </div>
   )
 }
 
 export default ErrorComponent