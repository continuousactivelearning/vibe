import * as React from 'react'; 
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const gradeData = [
    { name: 'Grade 1', value: 22.67 },
    { name: 'Grade 2', value: 20.33 },
    { name: 'Grade 3', value: 21.33 },
    { name: 'Grade 4', value: 14.67 },
    { name: 'Grade 5', value: 21.00 },
  ];

  const courseData = [
    { name: 'Course 1', value: 80 },
    { name: 'Course 2', value: 65 },
    { name: 'Course 3', value: 95 },
    { name: 'Course 4', value: 45 },
    { name: 'Course 5', value: 90 },
  ];

  const examResults = [
    { name: '1st Attempt', value: 75 },
    { name: 'Multiple Attempts', value: 50 },
  ];

  const subjectScores = {
    rank: 1, scores: 14, answeredFirstAttempt: 8, answeredMultipleAttempts: 5,
    topicProficiency: 0, tutorialsViewed: 1, timeSpent: 4, viewedHints: 6,
  };

  const progressBarStyle = buildStyles({
    pathColor: '#FF6F61', trailColor: '#E2E8F0',
  });

  const topStudents = [
    { name: 'Glenn Maxwell', marks: '80/100' },
    { name: 'Cathe Heavan', marks: '70/100' },
    { name: 'Yeadar Gil', marks: '35/100' },
    { name: 'Preeth Shing', marks: '90/100' },
  ];

  return (
    <div className="p-3 bg-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Student Performance Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select className="p-1 text-xs rounded-lg border border-gray-300">
            <option>All</option><option>2021</option><option>2022</option>
          </select>
          <select className="p-1 text-xs rounded-lg border border-gray-300">
            <option>All Grades</option><option>Grade 1</option><option>Grade 2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Students by Grade Section */}
        <div className="bg-white p-2 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Students by Grade</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={gradeData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="70%" fill="#8884d8">
                {gradeData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#FF6F61', '#FFB74D', '#FFEB3B', '#C5E1A5', '#8E24AA'][index]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Courses Progress Section */}
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

        {/* Progress Overview Section */}
        <div className="bg-white p-2 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Progress Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(subjectScores).map((key, idx) => (
              <div key={idx} className="flex flex-col items-center">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Examination Results Section - Larger Height */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Examination Results</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={examResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Bar dataKey="value" fill="#FFB74D" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Students Section - Larger Height */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Top 5 Students</h3>
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
      </div>
    </div>
  );
};

export default Dashboard;


