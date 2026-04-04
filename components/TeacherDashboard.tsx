import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Student, GradeData, Admin } from '../types';
import * as Storage from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { Users, Plus, Save, Trash2, Search, X, LogOut, Download, Pencil, UserCog, Database, Upload, FileJson, Loader2, Wifi, WifiOff } from 'lucide-react';

interface Props {
  admin: Admin;
  onLogout: () => void;
  onProfileUpdate: (admin: Admin) => void;
}

// Define Max Scores for validation
const MAX_SCORES: GradeData = {
  attendance: 5,
  quizzes: 10,
  assignments: 5,
  ogr: 10,
  mte: 20,
  fe: 20,
  reporting: 15,
  fr: 15
};

const TeacherDashboard: React.FC<Props> = ({ admin, onLogout, onProfileUpdate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);

  // Debounce timers: key = `${studentId}:${field}`
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Snapshot before optimistic update for rollback
  const prevStudentsRef = useRef<Student[]>([]);
  
  // Student Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalId, setOriginalId] = useState<string | null>(null);
  
  // Admin Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
      name: admin.name,
      id: admin.id,
      email: admin.email || '',
      password: admin.password
  });

  // Student Form State
  const [formData, setFormData] = useState({ 
      name: '', 
      id: '', 
      password: 'student_pass', 
      email: '' 
  });
  const [currentGrades, setCurrentGrades] = useState<GradeData | null>(null);

  useEffect(() => {
    // Initial load
    loadStudents();

    // Real-time subscription (Supabase only)
    const unsubscribe = Storage.subscribeToStudents((fresh) => {
        setStudents(fresh);
    });

    if (isSupabaseConfigured()) {
        setIsRealtime(true);
    }

    return () => {
        unsubscribe();
        // Clear any pending debounce timers
        debounceTimers.current.forEach((t) => clearTimeout(t));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const data = await Storage.getStudents();
    setStudents(data);
    setLoading(false);
  };

  // --- Student Management Functions ---

  const openAddModal = () => {
      setIsEditing(false);
      setFormData({ name: '', id: '', password: 'student_pass', email: '' });
      setCurrentGrades(null);
      setOriginalId(null);
      setShowModal(true);
  };

  const openEditModal = (student: Student) => {
      setIsEditing(true);
      setFormData({ 
          name: student.name, 
          id: student.id, 
          password: student.password, 
          email: student.email || '' 
      });
      setCurrentGrades(student.gradeData);
      setOriginalId(student.id);
      setShowModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;
    
    // Default empty grades if new, otherwise keep existing
    const gradeData = currentGrades || {
      attendance: 0, quizzes: 0, assignments: 0, ogr: 0,
      mte: 0, fe: 0, reporting: 0, fr: 0
    };

    const studentObj: Student = {
        ...formData,
        gradeData
    };

    let success = false;

    if (isEditing && originalId) {
        success = await Storage.updateStudentProfile(studentObj, originalId);
    } else {
        success = await Storage.addStudent(studentObj);
    }

    if (success) {
      loadStudents();
      setShowModal(false);
    } else {
      alert(isEditing ? "Failed to update. ID might already exist." : "Student ID already exists or connection failed!");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm("Delete this student record?")) {
      await Storage.deleteStudent(id);
      loadStudents();
    }
  };

  const handleGradeChange = useCallback(async (studentId: string, field: keyof GradeData, value: string) => {
    let numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;
    if (numValue < 0) numValue = 0;
    if (numValue > MAX_SCORES[field]) numValue = MAX_SCORES[field];

    // 1. Snapshot for potential rollback
    prevStudentsRef.current = students;

    // 2. Optimistic UI Update
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, gradeData: { ...s.gradeData, [field]: numValue } }
          : s
      )
    );

    // 3. Debounce the API call (500 ms)
    const key = `${studentId}:${field}`;
    const existing = debounceTimers.current.get(key);
    if (existing) clearTimeout(existing);

    debounceTimers.current.set(
      key,
      setTimeout(async () => {
        debounceTimers.current.delete(key);
        setStudents((current) => {
          const studentToSave = current.find((s) => s.id === studentId);
          if (studentToSave) {
            Storage.updateStudentGrades(studentToSave).then((ok) => {
              if (!ok) {
                console.error('Failed to save grade, rolling back UI');
                setStudents(prevStudentsRef.current);
              }
            });
          }
          return current;
        });
      }, 500)
    );
  }, [students]);

  // --- Admin Profile Management ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      const updatedAdmin: Admin = {
          name: profileForm.name,
          id: profileForm.id,
          email: profileForm.email,
          password: profileForm.password
      };

      const success = await Storage.updateAdmin(updatedAdmin, admin.id);
      if (success) {
          onProfileUpdate(updatedAdmin);
          setShowProfileModal(false);
          alert("Profile updated successfully.");
      } else {
          alert("Failed to update profile. ID might already exist.");
      }
  };

  // --- Calculations ---

  const calculateMidtermTotal = (g: GradeData) => {
    return (g.attendance + g.quizzes + g.assignments + g.ogr + g.mte);
  };

  const getTransmutedGrade = (score: number) => {
    const roundedScore = Math.round(score);
    if (roundedScore >= 45) return 1.0;
    if (roundedScore < 20) return 5.0; 
    const grade = 1.0 + (45 - roundedScore) * 0.1;
    return parseFloat(grade.toFixed(1));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       <header className="bg-slate-800 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-full mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-indigo-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
             </div>
             <div>
                <h1 className="font-bold text-lg tracking-wide leading-tight">GradeMaster <span className="text-indigo-400 font-light">Admin</span></h1>
                <p className="text-xs text-gray-400">{admin.name}</p>
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
                        name: admin.name,
                        id: admin.id,
                        email: admin.email || '',
                        password: admin.password
                    });
                    setShowProfileModal(true);
                }}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition text-sm text-gray-200"
                title="Admin Settings"
            >
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
            </button>
            <button 
                onClick={onLogout}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition px-2"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
            </div>
            <button 
                onClick={openAddModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
            >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Student</span>
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden relative">
            
            {loading && (
                <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
                        <p className="text-gray-500 text-sm">Loading records...</p>
                    </div>
                </div>
            )}

            {/* Spreadsheet Header */}
            <div className="overflow-x-auto flex-1">
                <table className="min-w-max w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="sticky left-0 bg-gray-50 z-20 px-4 py-3 border-b border-r border-gray-200 w-64 min-w-[250px]">Student Name</th>
                            
                            {/* Class Standing 30% */}
                            <th className="text-center px-2 py-3 border-b border-gray-200 bg-blue-50/50" colSpan={4}>Class Standing (30%)</th>
                            
                            {/* Exams 40% */}
                            <th className="text-center px-2 py-3 border-b border-gray-200 bg-yellow-50/50" colSpan={1}>Exam</th>
                            
                            {/* Midterm Grade */}
                            <th className="text-center px-2 py-3 border-b border-gray-200 bg-green-50/50" colSpan={2}>Midterm Grade (50%)</th>
                            <th className="px-2 py-3 border-b border-gray-200 w-24">Actions</th>
                        </tr>
                        <tr className="text-xs text-gray-500">
                            <th className="sticky left-0 bg-gray-50 z-20 px-4 py-2 border-b border-r border-gray-200">ID No.</th>
                            
                            {/* Sub Headers with Max Points */}
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-24">Attd (5)</th>
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-24">Quiz (10)</th>
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-24">Assn (5)</th>
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-24">Recit (10)</th>
                            
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-32 border-l border-gray-200">Midterm (20)</th>
                            
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-28 bg-gray-50 font-bold text-gray-700 border-l border-gray-200">Total (50)</th>
                            <th className="px-2 py-2 border-b border-gray-200 text-center w-20 bg-gray-50 font-bold text-gray-700">Grade</th>
                            <th className="px-2 py-2 border-b border-gray-200"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((student, idx) => {
                            const totalMidterm = calculateMidtermTotal(student.gradeData);
                            const grade = getTransmutedGrade(totalMidterm);
                            const isFail = grade > 3.0;

                            return (
                                <tr key={student.id} className="hover:bg-indigo-50/30 transition group">
                                    <td className="sticky left-0 bg-white group-hover:bg-indigo-50/30 px-4 py-2 border-r border-gray-200">
                                        <div className="font-medium text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-400">{student.id}</div>
                                    </td>

                                    {/* Inputs */}
                                    <td className="p-1"><input type="number" step="0.1" min="0" max="5" className="w-full h-8 text-center border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm" value={student.gradeData.attendance} onChange={(e) => handleGradeChange(student.id, 'attendance', e.target.value)} /></td>
                                    <td className="p-1"><input type="number" step="0.1" min="0" max="10" className="w-full h-8 text-center border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm" value={student.gradeData.quizzes} onChange={(e) => handleGradeChange(student.id, 'quizzes', e.target.value)} /></td>
                                    <td className="p-1"><input type="number" step="0.1" min="0" max="5" className="w-full h-8 text-center border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm" value={student.gradeData.assignments} onChange={(e) => handleGradeChange(student.id, 'assignments', e.target.value)} /></td>
                                    <td className="p-1"><input type="number" step="0.1" min="0" max="10" className="w-full h-8 text-center border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm" value={student.gradeData.ogr} onChange={(e) => handleGradeChange(student.id, 'ogr', e.target.value)} /></td>
                                    
                                    <td className="p-1 border-l border-gray-100"><input type="number" step="0.1" min="0" max="20" className="w-full h-8 text-center border border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm" value={student.gradeData.mte} onChange={(e) => handleGradeChange(student.id, 'mte', e.target.value)} /></td>

                                    <td className="px-2 py-2 text-center font-bold text-gray-700 bg-gray-50/50 border-l border-gray-200">
                                        {totalMidterm.toFixed(2)}
                                    </td>
                                    <td className={`px-2 py-2 text-center font-extrabold bg-gray-50/50 ${isFail ? 'text-red-500' : 'text-green-600'}`}>
                                        {grade.toFixed(1)}
                                    </td>
                                    <td className="px-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(student)} 
                                                className="text-gray-400 hover:text-indigo-600 transition"
                                                title="Edit Details"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteStudent(student.id)} 
                                                className="text-gray-400 hover:text-red-500 transition"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && !loading && (
                            <tr>
                                <td colSpan={13} className="text-center py-12 text-gray-400 italic">
                                    No students found. Click "Add Student" to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Add/Edit Student Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Student Details' : 'New Student Record'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSaveStudent} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input 
                        required
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.id}
                        onChange={e => setFormData({...formData, id: e.target.value})}
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                        required
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        type="email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition">
                    {isEditing ? 'Save Changes' : 'Create Record'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* Admin Profile Settings Modal */}
        {showProfileModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-indigo-600" />
                            Update Admin Profile
                        </h3>
                        <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={profileForm.id}
                                onChange={e => setProfileForm({...profileForm, id: e.target.value})}
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

export default TeacherDashboard;