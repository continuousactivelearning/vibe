import * as React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { FaRegClock } from 'react-icons/fa'; // Removed Play/Pause icon
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeeklyProgress } from '@/store/slices/FetchWeeklyProgress'; // Adjust path as needed

interface WeeklyProgressData {
  day: number;
  progress: number;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();

  // Select the weeklyProgress data, loading, and error states from Redux store
  const { weeklyProgress, loading, error } = useSelector(
    (state: any) => state.weeklyProgress
  );

  React.useEffect(() => {
    if (!weeklyProgress || weeklyProgress.length === 0) {
      dispatch(fetchWeeklyProgress());
    }
  }, [dispatch, weeklyProgress]);

  const courseData = [
    { name: 'Course 1', value: 80 },
    { name: 'Course 2', value: 65 },
    { name: 'Course 3', value: 95 },
    { name: 'Course 4', value: 45 },
    { name: 'Course 5', value: 90 },
  ];

  const subjectScores = {
    rank: 1,
    scores: 14,
    answeredFirstAttempt: 8,
    answeredMultipleAttempts: 5,
    topicProficiency: 0,
    tutorialsViewed: 1,
    timeSpent: 4,
    viewedHints: 6,
  };

  const progressBarStyle = buildStyles({
    pathColor: '#FF6F61',
    trailColor: '#E2E8F0',
  });

  const topStudents = [
    { name: 'Glenn Maxwell', marks: '80/100' },
    { name: 'Cathe Heavan', marks: '70/100' },
    { name: 'Yeadar Gil', marks: '35/100' },
    { name: 'Preeth Shing', marks: '90/100' },
  ];

  const badges = [
    { name: 'Achiever', description: 'Awarded for high scores across modules' },
    { name: 'Explorer', description: 'Awarded for completing all course modules' },
    { name: 'Quiz Master', description: 'Awarded for consistent quiz performance' },
  ];

  const [elapsedTime, setElapsedTime] = React.useState<string>('00:00:00');
  const [loginTime, setLoginTime] = React.useState<number | null>(null);
  const [intervalId, setIntervalId] = React.useState<NodeJS.Timeout | null>(null);

  // Start the clock when the student logs in
  const startClock = () => {
    let storedLoginTime = localStorage.getItem('loginTime');
    if (storedLoginTime) {
      setLoginTime(Number(storedLoginTime));
    } else {
      const currentLoginTime = Date.now();
      setLoginTime(currentLoginTime);
      localStorage.setItem('loginTime', currentLoginTime.toString());
    }

    const id = setInterval(() => {
      if (loginTime) {
        const now = Date.now();
        const diff = Math.floor((now - loginTime) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);

    setIntervalId(id);
  };

  React.useEffect(() => {
    startClock();
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loginTime]);

  // Fetch Weekly Progress from the backend API
  const fetchWeeklyProgressData = async () => {
    try {
      // Use the correct environment variable for Vite
      const response = await fetch(`${import.meta.env.VITE_ACTIVITY_ENGINE_URL}/weekly-progress`);
      const data = await response.json();
      console.log('Fetched Weekly Progress Data:', data);
      dispatch(fetchWeeklyProgress(data));  // Dispatch to Redux Store
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
    }
  };

  return (
    <div className="p-3 bg-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        {/* Clock Icon with Elapsed Time */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-900">Logged In Time:</span>
          <span className="text-xs font-medium text-gray-600">{elapsedTime}</span>
          {/* Static clock icon next to the time */}
          <div className="ml-2">
            <FaRegClock className="text-gray-700" />
          </div>
        </div>

        {/* Log Out Button */}
        <div className="flex items-center">
          <Button onClick={() => localStorage.removeItem('loginTime')} className="text-xs px-3 py-1">Log Out</Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-md font-semibold text-gray-900">Student Performance Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select className="p-1 text-xs rounded-lg border border-gray-300">
            <option>All</option>
            <option>2021</option>
            <option>2022</option>
          </select>
          <select className="p-1 text-xs rounded-lg border border-gray-300">
            <option>All Grades</option>
            <option>Grade 1</option>
            <option>Grade 2</option>
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading Weekly Progress...</p>}
      {error && <p>Error: {error}</p>}

      {/* Display message when no data is available */}
      {!loading && weeklyProgress && weeklyProgress.length === 0 && <p>No weekly progress data available.</p>}

      {/* Display Weekly Progress Data */}
      {!loading && weeklyProgress && weeklyProgress.length > 0 && (
        <div className="weekly-progress">
          <h2 className="text-xl font-semibold">Weekly Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weeklyProgress.map((dayData: WeeklyProgressData, index: number) => (
              <div key={index} className="day-progress">
                <h4 className="text-sm">{`Day ${dayData.day}`}</h4>
                <p>{`Progress: ${dayData.progress}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Progress Overview Section (Left side with Circular Progress Bars) */}
        <div className="bg-white p-2 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Progress Overview</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(subjectScores).map((key, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center">
                <h4 className="text-xs font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <CircularProgressbar
                  value={subjectScores[key as keyof typeof subjectScores]}
                  text={subjectScores[key as keyof typeof subjectScores].toString()}
                  styles={progressBarStyle}
                  strokeWidth={6} className="w-14 h-14"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Courses Progress Section (Right side with Bar Chart) */}
        <div className="bg-white p-2 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Courses Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Bar dataKey="value" fill="#FF6F61" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 Students and Badges Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Top 5 Students Section */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Top 5 Students</h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left text-xs">Student Name</th>
                <th className="p-1 text-left text-xs">Marks</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((student, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-1 text-xs">{student.name}</td>
                  <td className="p-1 text-xs">{student.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Badges Section */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Badges</h3>
          <ul className="list-disc pl-4 text-xs">
            {badges.map((badge, idx) => (
              <li key={idx} className="mb-3">
                <strong>{badge.name}:</strong> {badge.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

