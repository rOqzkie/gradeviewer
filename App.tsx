
import React, { useState, useEffect } from 'react';
import { UserRole, Student, Admin } from './types';
import * as Storage from './services/storageService';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import LandingPage from './components/LandingPage';
import { ShieldCheck, GraduationCap, Lock, ArrowRight, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [role, setRole] = useState<UserRole>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  // Login Form State
  const [loginMode, setLoginMode] = useState<'student' | 'teacher'>('student');
  const [idInput, setIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Persist session check
  useEffect(() => {
    const checkSession = async () => {
        const savedRole = localStorage.getItem('gm_role');
        const savedId = localStorage.getItem('gm_id');
        const savedPass = localStorage.getItem('gm_token'); 

        if (!savedId || !savedPass) return;

        try {
            if (savedRole === 'admin') {
                const admin = await Storage.authenticateAdmin(savedId, savedPass);
                if (admin) {
                    setCurrentAdmin(admin);
                    setRole('admin');
                } else {
                    // Invalid session data found, clear it
                    localStorage.removeItem('gm_role');
                    localStorage.removeItem('gm_id');
                    localStorage.removeItem('gm_token');
                }
            } else if (savedRole === 'student') {
               const student = await Storage.authenticateStudent(savedId, savedPass);
               if (student) {
                 setCurrentStudent(student);
                 setRole('student');
               } else {
                 localStorage.removeItem('gm_role');
                 localStorage.removeItem('gm_id');
                 localStorage.removeItem('gm_token');
               }
            }
        } catch (e) {
            console.error("Session restoration failed", e);
        }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (loginMode === 'teacher') {
            const admin = await Storage.authenticateAdmin(idInput, passwordInput);
            if (admin) {
              setCurrentAdmin(admin);
              setRole('admin');
              localStorage.setItem('gm_role', 'admin');
              localStorage.setItem('gm_id', admin.id);
              localStorage.setItem('gm_token', passwordInput); 
            } else {
              setError('Invalid Admin ID or Password. Check your Supabase configuration.');
            }
          } else {
            const student = await Storage.authenticateStudent(idInput, passwordInput);
            if (student) {
              setCurrentStudent(student);
              setRole('student');
              localStorage.setItem('gm_role', 'student');
              localStorage.setItem('gm_id', student.id);
              localStorage.setItem('gm_token', passwordInput);
            } else {
              setError('Invalid ID or Password');
            }
          }
    } catch (err) {
        console.error(err);
        setError("Connection Error. Check browser console.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentStudent(null);
    setCurrentAdmin(null);
    localStorage.removeItem('gm_role');
    localStorage.removeItem('gm_id');
    localStorage.removeItem('gm_token');
    setIdInput('');
    setPasswordInput('');
    setError('');
    setShowLanding(true);
  };

  const handleProfileUpdate = (updatedStudent: Student) => {
      setCurrentStudent(updatedStudent);
      localStorage.setItem('gm_token', updatedStudent.password);
  };

  const handleAdminProfileUpdate = (updatedAdmin: Admin) => {
      setCurrentAdmin(updatedAdmin);
      localStorage.setItem('gm_id', updatedAdmin.id); 
      localStorage.setItem('gm_token', updatedAdmin.password);
  };

  // Render Logic
  if (role === 'admin' && currentAdmin) {
    return <TeacherDashboard admin={currentAdmin} onLogout={handleLogout} onProfileUpdate={handleAdminProfileUpdate} />;
  }

  if (role === 'student' && currentStudent) {
    return <StudentDashboard student={currentStudent} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
  }

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex overflow-hidden min-h-[500px]">
        
        {/* Left Side: Branding / Info */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 L100 0 L100 100 Z" fill="white" />
             </svg>
          </div>

          <div className="z-10">
            <div className="flex items-center gap-3 text-white mb-6">
               <div className="bg-white/20 p-2 rounded-lg">
                  <BookOpen className="h-8 w-8" />
               </div>
               <span className="text-2xl font-bold tracking-tight">GradeMaster AI</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Empowering Education with Intelligent Insights.
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              Track grades, analyze performance, and foster growth. A secure platform for students and educators to connect through data.
            </p>
          </div>

          <div className="z-10 text-xs text-indigo-300">
            © 2024 Education Tech Systems
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-8 bg-gray-100 p-1 rounded-full w-fit mx-auto">
             <button 
               onClick={() => { setLoginMode('student'); setError(''); setIdInput(''); setPasswordInput(''); }}
               className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${loginMode === 'student' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <GraduationCap className="h-4 w-4" /> Student
             </button>
             <button 
               onClick={() => { setLoginMode('teacher'); setError(''); setIdInput(''); setPasswordInput(''); }}
               className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${loginMode === 'teacher' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <ShieldCheck className="h-4 w-4" /> Teacher
             </button>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">
              {loginMode === 'student' ? 'Student Login' : 'Instructor Login'}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {loginMode === 'student' ? 'View your grades and performance insights.' : 'Access class records and administration.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {loginMode === 'student' ? 'Student ID No.' : 'Admin ID No.'}
                </label>
                <div className="relative">
                  <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={loginMode === 'student' ? "e.g. 2024001" : "e.g. admin"}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    value={idInput}
                    onChange={e => setIdInput(e.target.value)}
                  />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl 
                              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                              outline-none transition"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.042.159-2.045.45-2.987m3.36-2.52A9.961 9.961 0 0112 3c5.523 0 10 4.477 10 10 0 2.042-.613 3.937-1.665 5.523M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .352-.06.69-.17 1m-1.45 1.45A3 3 0 019 12c0-.352.06-.69.17-1m9.52-3.88A9.955 9.955 0 0121 12c0 5.523-4.477 10-10 10a9.955 9.955 0 01-4.88-1.36m-.1-14.28A9.953 9.953 0 0112 3c2.042 0 3.937.613 5.523 1.665"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

             {error && (
               <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                 {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 group"
             >
               {isLoading ? 'Connecting...' : (loginMode === 'student' ? 'View My Grades' : 'Access Dashboard')}
               {!isLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
             </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-400">
             <p>Forgot password? Contact system administrator.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default App;
