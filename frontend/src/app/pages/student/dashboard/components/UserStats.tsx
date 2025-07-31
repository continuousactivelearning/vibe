import { StatCard } from "@/components/ui/StatCard";

interface UserStatsProps {
  totalEnrollments: number;
  watchtimeData?: number; // in seconds
  totalProgress: number;
  className?: string;
  statCardClassName?: string;
}

export const UserStats = ({
  totalEnrollments,
  watchtimeData = 0,
  totalProgress,
  className = "flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto",
  statCardClassName = ""
}: UserStatsProps) => {
  return (
    <div className={className}>
      <StatCard 
        icon="🏆" 
        value={`${totalEnrollments}`} 
        label="Enrolled Courses" 
        className={statCardClassName}
      />
      <StatCard 
        icon="⏱️" 
        value={`${(watchtimeData / 3600).toFixed(2)}h`} 
        label="Study Time" 
        className={statCardClassName}
      />
      <StatCard 
        icon="🎓" 
        value={`${totalProgress}%`} 
        label="Overall Progress" 
        className={statCardClassName}
      />
    </div>
  );
};