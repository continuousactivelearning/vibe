import { Link } from 'react-router-dom';
import { Home, GraduationCap, ChevronRight } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { sortItemsByOrder } from '../helpers/sortItemsByOrder';
import { getItemIcon } from '../helpers/getItemIcon';
import FloatingVideo from '@/components/floating-video';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Ref } from 'react';

interface SidebarComponentProps {
  modules: any[];
  expandedModules: Record<string, boolean>;
  selectedModuleId: string | null;
  expandedSections: Record<string, boolean>;
  selectedSectionId: string | null;
  selectedItemId: string | null;
  sectionItems: Record<string, any[]>;
  itemsLoading: boolean;
  activeSectionInfo: { sectionId: string } | null;
  currentItem: any | null;
  itemLoading: boolean;
  selectedItemRef:Ref<HTMLAnchorElement>  | null;
  user: {
    name?: string;
    avatar?: string;
  } | null;
  proctoringData: any;
  anomalies: any[];
  rewindVid: boolean;
  pauseVid: boolean;
  setDoGesture: (gesture: boolean) => void;
  setAnomalies: (anomalies: any[]) => void;
  setRewindVid: (rewind: boolean) => void;
  setPauseVid: (pause: boolean) => void;
  toggleModule: (moduleId: string) => void;
  toggleSection: (moduleId: string, sectionId: string) => void;
  handleSelectItem: (moduleId: string, sectionId: string, itemId: string) => void;
}

export const SidebarComponent: React.FC<SidebarComponentProps> = ({
  modules,
  expandedModules,
  selectedModuleId,
  expandedSections,
  selectedSectionId,
  selectedItemId,
  sectionItems,
  itemsLoading,
  activeSectionInfo,
  currentItem,
  itemLoading,
  selectedItemRef,
  user,
  proctoringData,
  anomalies,
  rewindVid,
  pauseVid,
  setDoGesture,
  setAnomalies,
  setRewindVid,
  setPauseVid,
  toggleModule,
  toggleSection,
  handleSelectItem,
}) => {

    return <Sidebar variant="inset" className="border-r border-border/40 bg-sidebar/50 backdrop-blur-sm">
            <SidebarHeader className="border-b border-border/40 bg-gradient-to-b from-sidebar/80 to-sidebar/60">
              {/* Vibe Logo and Brand */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg overflow-hidden">
                  <img
                    src="https://continuousactivelearning.github.io/vibe/img/logo.png"
                    alt="Vibe Logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[1.15rem] font-bold leading-none">
                    <AuroraText colors={["#A07CFE", "#FE8FB5", "#FFBE7B"]}><b>ViBe</b></AuroraText>
                  </span>
                  <p className="text-xs text-muted-foreground">Learning Platform</p>
                </div>
              </div>

              <Separator className="opacity-50" />
            </SidebarHeader>

            <SidebarContent className="bg-card/50 pl-2 shadow-sm border border-border/30">
              <ScrollArea className="flex-1 transition-colors">
                <SidebarMenu className="space-y-1 text-sm pr-0">
                  {modules.map((module: any) => {
                    const moduleId = module.moduleId;
                    const isModuleExpanded = expandedModules[moduleId];
                    const isCurrentModule = moduleId === selectedModuleId;

                    return (
                      <SidebarMenuItem key={moduleId}>
                        <SidebarMenuButton
                          onClick={() => toggleModule(moduleId)}
                          isActive={isCurrentModule}
                          className="group relative h-10 px-3 w-full rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/5 hover:shadow-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/15 data-[state=active]:to-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                          <ChevronRight
                            className={`h-3.5 w-3.5 transition-transform duration-200 flex-shrink-0 ${isModuleExpanded ? 'rotate-90' : ''
                              }`}
                          />
                          <div className="flex-1 text-left min-w-0 ml-2">
                            <div className="font-medium text-xs truncate" title={module.name}>
                              {module.name.length > 34 ? `${module.name.substring(0, 31)}...` : module.name}
                            </div>
                            <div className="text-[10px] text-muted-fore</div>ground truncate">
                              {module.sections?.length || 0} sections
                            </div>
                          </div>
                        </SidebarMenuButton>

                        {isModuleExpanded && module.sections && (
                          <SidebarMenuSub className="ml-0 mt-1 space-y-1">
                            {module.sections.map((section: any) => {
                              const sectionId = section.sectionId;
                              const isSectionExpanded = expandedSections[sectionId];
                              const isCurrentSection = sectionId === selectedSectionId;
                              const isLoadingItems = activeSectionInfo?.sectionId === sectionId && itemsLoading;

                              return (
                                <SidebarMenuSubItem key={sectionId}>
                                  <SidebarMenuSubButton
                                    onClick={() => toggleSection(moduleId, sectionId)}
                                    isActive={isCurrentSection}
                                    className="group relative h-8 px-3 w-full rounded-md text-xs transition-all duration-200 hover:bg-accent/10 hover:text-accent-foreground data-[state=active]:bg-accent/15 data-[state=active]:text-accent-foreground"
                                  >
                                    <ChevronRight
                                      className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${isSectionExpanded ? 'rotate-90' : ''
                                        }`}
                                    />
                                    <div className="font-medium truncate flex-1 min-w-0 ml-2" title={section.name}>
                                      {section.name.length > 27 ? `${section.name.substring(0, 24)}...` : section.name}
                                    </div>
                                  </SidebarMenuSubButton>

                                  {isSectionExpanded && (
                                    <SidebarMenuSub className="ml-0 mt-1 space-y-0.5">
                                      {isLoadingItems ? (
                                        <div className="space-y-1 p-2">
                                          <Skeleton className="h-4 w-full rounded" />
                                          <Skeleton className="h-4 w-4/5 rounded" />
                                        </div>
                                      ) : sectionItems[sectionId] ? (
                                        sortItemsByOrder(sectionItems[sectionId]).map((item: any) => {
                                          const itemId = item._id;
                                          const isCurrentItem = itemId === selectedItemId;
                                          if (item.type === 'QUIZ') return null; // Skip quizzes in sidebar
                                          return (
                                            <SidebarMenuSubItem key={itemId}>
                                              <SidebarMenuSubButton
                                                onClick={() => handleSelectItem(moduleId, sectionId, itemId)}
                                                isActive={isCurrentItem}
                                                className="group relative h-8 px-3 w-full rounded-md transition-all duration-200 hover:bg-accent/10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary justify-start"
                                                ref={isCurrentItem ? selectedItemRef : null}
                                              >
                                                <div className="flex items-center gap-2 w-full min-w-0">
                                                  <div className={`p-0.5 rounded transition-colors flex-shrink-0 ${isCurrentItem
                                                    ? "bg-primary/15 text-primary"
                                                    : "bg-accent/15 text-accent-foreground group-hover:bg-accent/25"
                                                    }`}>
                                                    {getItemIcon(item.type)}
                                                  </div>
                                                  <div className="flex-1 text-left min-w-0">
                                                    <div className="text-xs font-medium truncate w-full" title={currentItem?.name || 'Loading...'}>
                                                      {(() => {
                                                        // Find all non-QUIZ items in this section, sorted by order
                                                        const itemsInSection = sortItemsByOrder(sectionItems[sectionId] || []).filter((i: any) => i.type !== 'QUIZ');
                                                        // Find the index of this item among non-QUIZ items
                                                        const itemIndex = itemsInSection.findIndex((i: any) => i._id === itemId);
                                                        // Compose the label with numbering
                                                        let label = '';
                                                        if (selectedItemId === itemId && itemLoading) {
                                                          label = 'Loading...';
                                                        } else if (selectedItemId === itemId && currentItem?.name) {
                                                          label = currentItem.name.length > 18 ? `${currentItem.name.substring(0, 15)}...` : currentItem.name;
                                                        } else {
                                                          label = ' ';
                                                        }
                                                        // Add numbering prefix (e.g., Video 1, Article 2, etc.)
                                                        const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase();
                                                        return label === ' ' ? `${typeLabel} ${itemIndex + 1}` : `${label}`;
                                                      })()}
                                                    </div>
                                                  </div>
                                                </div>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          );
                                        })
                                      ) : (
                                        <div className="p-3 text-center">
                                          <div className="text-xs text-muted-foreground">No items found</div>
                                        </div>
                                      )}
                                    </SidebarMenuSub>
                                  )}
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </ScrollArea>
            </SidebarContent>
            <SidebarFooter className="border-t border-border/40 bg-gradient-to-t from-sidebar/80 to-sidebar/60 ">
              <FloatingVideo
                isVisible={true}
                onClose={() => { }}
                onAnomalyDetected={() => { }}
                setDoGesture={setDoGesture}
                settings={proctoringData || {
                  _id: "",
                  studentId: "",
                  versionId: "",
                  courseId: "",
                  settings: {
                    proctors: {
                      detectors: []
                    }
                  }
                }}
                anomalies={anomalies}
                setAnomalies={setAnomalies}
                rewindVid={rewindVid}
                setRewindVid={setRewindVid}
                pauseVid={pauseVid}
                setPauseVid={setPauseVid}
              />
            </SidebarFooter>
            {/* Navigation Footer */}
            <SidebarFooter className="border-t border-border/40 bg-gradient-to-t from-sidebar/80 to-sidebar/60">
              <SidebarMenu className="space-y-1 pl-2 py-3">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-9 px-3 w-full rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/5 hover:shadow-sm"
                  >
                    <Link to="/student" className="flex items-center gap-3">
                      <div className="p-1 rounded-md bg-accent/15">
                        <Home className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-9 px-3 w-full rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/5 hover:shadow-sm"
                  >
                    <Link to="/student/courses" className="flex items-center gap-3">
                      <div className="p-1 rounded-md bg-accent/15">
                        <GraduationCap className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <span className="text-sm font-medium">Courses</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Separator className="my-2 opacity-50" />

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-10 px-3 w-full rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/5 hover:shadow-sm"
                  >
                    <Link to="/student/profile" className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 border border-border/20">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-bold text-xs">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium truncate" title={user?.name || 'Profile'}>{user?.name || 'Profile'}</div>
                        <div className="text-xs text-muted-foreground">View Profile</div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
}
