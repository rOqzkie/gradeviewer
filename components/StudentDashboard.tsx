import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { generateStudentInsight, generateStudyPlan } from '../services/geminiService';
import { updateStudentProfile, subscribeToStudent } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { GraduationCap, Sparkles, LogOut, FileText, ClipboardList, BookOpen, UserCog, X, Save, Wifi, WifiOff } from 'lucide-react';

interface Props {
  student: Student;
  onLogout: () => void;
  onProfileUpdate: (student: Student) => void;
}

const StudentDashboard: React.FC<Props> = ({ student, onLogout, onProfileUpdate }) => {
  // Local copy so real-time updates re-render without requiring parent state
  const [liveStudent, setLiveStudent] = useState<Student>(student);
  const [isRealtime, setIsRealtime] = useState(false);

  const [insight, setInsight] = useState<string>(student.aiSummary || '');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [activePlanCategory, setActivePlanCategory] = useState<string | null>(null);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
      name: student.name,
      email: student.email || '',
      password: student.password
  });

  // Real-time subscription: update local grades when teacher changes them
  useEffect(() => {
    const unsubscribe = subscribeToStudent(student.id, (updated) => {
      setLiveStudent((prev) => ({
        ...prev,
        gradeData: updated.gradeData,
      }));
    });

    if (isSupabaseConfigured()) {
      setIsRealtime(true);
    }

    return () => unsubscribe();
  }, [student.id]);

  const { gradeData } = liveStudent;

  // Midterm Calculation Logic (Max 50)
  const MIDTERM_MAX = 50;
  const totalScore = 
    gradeData.attendance +
    gradeData.quizzes +
    gradeData.assignments +
    gradeData.ogr +
    gradeData.mte;
  
  const getTransmutedGrade = (score: number) => {
    const roundedScore = Math.round(score);

    if (roundedScore >= 45) return 1.0;
    if (roundedScore < 20) return 5.0; 

    // Formula derived from table: 1.0 + (45 - Score) * 0.1
    const grade = 1.0 + (45 - roundedScore) * 0.1;
    return parseFloat(grade.toFixed(1));
  };

  const finalGrade = getTransmutedGrade(totalScore);
  const isPassing = finalGrade <= 3.0;

  // Chart Data - Showing Actual vs Max (Filtered for Midterm)
  const chartData = [
    { name: 'Attd', score: gradeData.attendance, max: 5 },
    { name: 'Quiz', score: gradeData.quizzes, max: 10 },
    { name: 'Assn', score: gradeData.assignments, max: 5 },
    { name: 'Recit', score: gradeData.ogr, max: 10 },
    { name: 'Midterm', score: gradeData.mte, max: 20 },
  ];

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const text = await generateStudentInsight(liveStudent);
    setInsight(text);
    setLoadingInsight(false);
  };

  const handleGetPlan = async (category: string) => {
      setActivePlanCategory(category);
      setLoadingPlan(true);
      const plan = await generateStudyPlan(liveStudent, category);
      setStudyPlan(plan);
      setLoadingPlan(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      const updatedStudent: Student = {
          ...liveStudent,
          name: profileForm.name,
          email: profileForm.email,
          password: profileForm.password
      };

      const success = await updateStudentProfile(updatedStudent);
      if (success) {
          setLiveStudent(updatedStudent);
          onProfileUpdate(updatedStudent);
          setShowProfileModal(false);
          alert("Profile updated successfully.");
      } else {
          alert("Failed to update profile. Connection error.");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-20 border-b border-slate-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500 p-2 rounded">
                <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CS 311</h1>
              <p className="text-xs text-gray-400">Automata Theory - Midterm Report</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isRealtime ? (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                <Wifi className="h-3 w-3" />
                Live
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
            <button 
                onClick={() => {
                    setProfileForm({
                        name: liveStudent.name,
                        email: liveStudent.email || '',
                        password: liveStudent.password
                    });
                    setShowProfileModal(true);
                }}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition text-sm text-gray-200"
                title="Profile Settings"
            >
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
            </button>
            <button 
                onClick={onLogout}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-red-900/50 px-3 py-2 rounded-lg transition text-sm text-gray-200"
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Main Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Student Information</h2>
                    <h3 className="text-2xl font-bold text-gray-800">{liveStudent.name}</h3>
                    <p className="text-gray-500 font-mono text-sm mt-1">{liveStudent.id}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Midterm Points</p>
                            <p className="text-3xl font-bold text-slate-800">{totalScore.toFixed(2)}<span className="text-lg text-gray-400 font-normal">/50</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Midterm Grade</p>
                            <span className={`text-4xl font-extrabold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                {finalGrade.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles className="h-32 w-32" />
                </div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    Midterm Performance Insights
                </h3>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 min-h-[120px]">
                    {insight ? (
                        <p className="text-indigo-50 leading-relaxed text-sm md:text-base">{insight}</p>
                    ) : (
                        <div className="flex flex-col items-start justify-center h-full">
                            <p className="text-indigo-100 mb-4 text-sm">Get an AI-powered analysis of your midterm grades, identifying strengths and areas for improvement.</p>
                            <button 
                                onClick={handleGenerateInsight}
                                disabled={loadingInsight}
                                className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition shadow-sm disabled:opacity-50"
                            >
                                {loadingInsight ? "Analyzing..." : "Analyze Performance"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grade Table */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-800">Midterm Score Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3 text-right">Max Points</th>
                                <th className="px-5 py-3 text-right">Your Score</th>
                                <th className="px-5 py-3 text-right">Performance</th>
                                <th className="px-5 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { label: 'Attendance', max: 5.0, score: gradeData.attendance, key: 'Attendance' },
                                { label: 'Quizzes', max: 10.0, score: gradeData.quizzes, key: 'Quizzes' },
                                { label: 'Assignments', max: 5.0, score: gradeData.assignments, key: 'Assignments' },
                                { label: 'Recitation (OGR)', max: 10.0, score: gradeData.ogr, key: 'Oral Recitation' },
                                { label: 'Midterm Exam', max: 20.0, score: gradeData.mte, key: 'Midterm Exam' },
                            ].map((row, i) => {
                                const percentage = (row.score / row.max) * 100;
                                return (
                                    <tr key={i} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-3 font-medium text-gray-800">{row.label}</td>
                                        <td className="px-5 py-3 text-right text-gray-500">{row.max.toFixed(1)}</td>
                                        <td className="px-5 py-3 text-right font-mono font-bold text-gray-800">
                                            {row.score.toFixed(1)}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`px-2 py-1 rounded text-xs ${percentage < 75 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {percentage < 80 && (
                                                <button 
                                                    onClick={() => handleGetPlan(row.key)}
                                                    className="text-xs text-indigo-600 hover:underline hover:text-indigo-800"
                                                >
                                                    Improve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-indigo-50 font-bold text-indigo-900 border-t border-indigo-100">
                            <tr>
                                <td className="px-5 py-3">Total Midterm</td>
                                <td className="px-5 py-3 text-right">50.0</td>
                                <td className="px-5 py-3 text-right">{totalScore.toFixed(2)}</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                        Performance Chart
                    </h3>
                </div>
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: '#f3f4f6'}} 
                                formatter={(value: number, name: string, props: any) => {
                                    return [`${value} / ${props.payload.max}`, 'Score'];
                                }}
                            />
                            {/* Background Bar for Max Score */}
                            <Bar dataKey="max" fill="#f3f4f6" radius={[0, 4, 4, 0]} barSize={20} />
                            {/* Actual Score Bar overlapping */}
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20} yAxisId={0}>
                                {chartData.map((entry, index) => {
                                    const percentage = (entry.score / entry.max);
                                    return <Cell key={`cell-${index}`} fill={percentage >= 0.75 ? '#4f46e5' : '#ef4444'} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Study Plan Modal */}
        {activePlanCategory && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        Improvement Plan: {activePlanCategory}
                    </h3>
                    
                    {loadingPlan ? (
                        <div className="py-8 text-center">
                             <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-600 rounded-full mb-2"></div>
                             <p className="text-gray-500 text-sm">Consulting AI advisor...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-indigo bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <p className="whitespace-pre-line text-indigo-900">{studyPlan}</p>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={() => setActivePlanCategory(null)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Profile Settings Modal */}
        {showProfileModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-indigo-600" />
                            Update Profile
                        </h3>
                        <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Read Only)</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                value={student.id}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={profileForm.name}
                                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={profileForm.email}
                                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={profileForm.password}
                                onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowProfileModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;