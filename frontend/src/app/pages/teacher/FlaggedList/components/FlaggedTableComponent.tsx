   import { Table,TableHeader,TableRow,TableHead } from '@/components/ui/table';
import React from 'react'
  
  export default function FlaggedTableComponent({handleSort, reports, sortBy, sortOrder, setSelectedReport, selectedReport, setIsUpdatingStatus, setUpdateStatusModalOpen, selectedFlagData }: any) {

    const tableHeaders=[
                        { key: 'reason', label: 'Reason', className: 'pl-6 w-[300px]' },
                        { key: 'entityType', label: 'Type', className: 'pl-6 w-[120px]' },
                          { key: 'status', label: 'Latest satus', className: 'w-[120px]' },
                        { key: 'reportedBy', label: 'Reported by', className: 'w-[120px]' },
                        { key: 'createdDate', label: 'Reported on', className: 'w-[200px]' },
                      ];
    return (
      <>
       <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/30 ">
                      {tableHeaders.map(({ key, label, className }) => (
                        <TableHead
                          key={key}
                          className={`font-bold text-foreground cursor-pointer select-none text-center align-middle ${className}`}
                          onClick={() => handleSort(key as 'name' | 'enrollmentDate' | 'progress')}
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            {sortBy === key && (
                              sortOrder === 'asc'
                                ? <ArrowUp size={16} className="text-foreground" />
                                : <ArrowDown size={16} className="text-foreground" />
                            )}
                          </span>
                        </TableHead>
                      ))}
                      <TableHead className="font-bold text-foreground pr-6 w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report:any) => (<>
                      <TableRow
                        key={report._id}
                        className="border-border hover:bg-muted/20 transition-colors duration-200 group"
                         onClick={() => {
                          if (selectedReport?.id === report._id) {
                            setSelectedReport(null); 
                          } else {
                            setSelectedReport({ id: report._id, status: report.latestStatus });
                          }
                        }}
                      >
                        <TableCell className="pl-6 py-6 w-[250px] align-top">
                            <div className="max-h-[100px] overflow-y-auto  whitespace-pre-wrap break-words text-sm pr-2">
                              {report.reason}
                            </div>
                          </TableCell>
                        <TableCell className="pl-6 py-6">
                          <span className="text-center align-middle">{report.entityType}</span>
                                       </TableCell>
                                       <TableCell className="pl-6 py-6">
                          <span >{report.latestStatus}</span>
                                       </TableCell>
                        <TableCell className="py-6">
                           
                            <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-md group-hover:border-primary/40 transition-colors duration-200">
                              <AvatarImage src="/placeholder.svg" alt={report.reportedBy.firstName} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                                {[
                                 report.reportedBy.firstName?.[0],
                                 report.reportedBy.lastName?.[0],
                                ]
                                  .filter(Boolean)
                                  .map((ch) => ch.toUpperCase())
                                  .join('') || (report.reportedBy.firstName?.[0]?.toUpperCase() ||report.reportedBy.lastName?.[0]?.toUpperCase() || '?')}
                              </AvatarFallback>
                            </Avatar>
                           <div className="min-w-0 flex-1">
                           <p className="font-semibold text-foreground text-lg overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]"
                              title={`${report.reportedBy.firstName} ${report.reportedBy.lastName}`}
                            >
                              {report.reportedBy.firstName + " " + report.reportedBy.lastName || "Unknown User"}
                            </p>
                          </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="text-muted-foreground font-medium ">
                            {new Date(report.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="py-6 pr-6 ">
                            {report.latestStatus!=="DISCARDED" && report.latestStatus!=="CLOSED" &&
                          <div className="flex items-center gap-3 border-2 border-blue-100 dark:border-blue-950 rounded-2xl ">
                              <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                               {  setIsUpdatingStatus(true)
                                  setUpdateStatusModalOpen(true);
                                setSelectedReport({ id: report._id, status: report.latestStatus });
                               }
                              }
                              className="text-blue-600 hover:text-blue-500 hover:bg-transparent dark:hover:bg-transparent transition-all duration-200 cursor-pointer pointer-events-auto"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                             Update Status
                            </Button>
                           
                          </div>
                          }
                        </TableCell>
                      
                      </TableRow>
                      <TableRow>
                         {selectedFlagData && selectedReport?.id === report._id && (
   <Dialog open={!isUpdatingStatus&&!!selectedFlagData} onOpenChange={()=>setSelectedReport(null)}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Flag className="h-5 w-5 text-primary" />
            Flag Report Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Flag Overview */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Reported by
                    </div>
                    <p className="font-medium">
                      {selectedFlagData.reportedBy.firstName} {selectedFlagData.reportedBy.lastName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Reported on
                    </div>
                    <p className="font-medium">
                      {new Date(selectedFlagData.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getEntityTypeIcon(selectedFlagData.entityType)}</span>
                    Entity Type
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {selectedFlagData.entityType}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Reason for flagging
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <p className="text-sm leading-relaxed">
                      {selectedFlagData.reason || (
                        <span className="italic text-muted-foreground">No reason provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Status Timeline
                </h3>

                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border"></div>

                  <div className="space-y-6">
                    {selectedFlagData.status.map((item, index) => (
                      <div key={index} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-sm">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-6">
                          <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                              <Badge className={getStatusColor(item.status)}>{item.status.replace("_", " ")}</Badge>

                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            {item.comment && (
                              <div className="bg-muted/30 rounded-md p-3 border-l-2 border-primary/30">
                                <p className="text-sm text-foreground leading-relaxed">{item.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Course :</span>
                    <p className="font-mono mt-1 break-all">{selectedFlagData.courseId.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Entity ID:</span>
                    <p className="font-mono mt-1 break-all">{selectedFlagData.entityId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <p className="mt-1">
                      {new Date(selectedFlagData.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
)
}
                      </TableRow></>
                    ))}
                  </TableBody>
                </Table>
              </div>
      </>
    )
  }
  