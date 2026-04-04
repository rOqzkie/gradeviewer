
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Student, GradeData, Admin } from '../types';

// --- FALLBACK DATA (Your Class Record) ---
const INITIAL_STUDENTS: Student[] = [
    { id: "2024001", name: "Day, Lady Grace S.", password: "password123", email: "lady@example.com", gradeData: { attendance: 4.5, quizzes: 7, assignments: 3.8, ogr: 3.5, mte: 10.5, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024002", name: "Tomalon, Laine Francis", password: "password123", email: "laine@example.com", gradeData: { attendance: 4.8, quizzes: 7.8, assignments: 3.6, ogr: 8.8, mte: 18.3, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024003", name: "Deleña, Bob Ryan A.", password: "password123", gradeData: { attendance: 5, quizzes: 7.1, assignments: 3.3, ogr: 8.2, mte: 10.3, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024004", name: "Ecuacion, Seth Luixo E.", password: "password123", gradeData: { attendance: 5, quizzes: 9.5, assignments: 3.5, ogr: 10, mte: 16.3, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024005", name: "Galagnao, Zoren P.", password: "password123", email: "zoren@gmail.com", gradeData: { attendance: 4, quizzes: 7.2, assignments: 2.4, ogr: 6.5, mte: 10.8, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024006", name: "Loren, Kiesser Leandro Y.", password: "password123", email: "loren@gmail.com", gradeData: { attendance: 4.8, quizzes: 4.3, assignments: 2.9, ogr: 5.3, mte: 6.5, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024007", name: "Mahinay, Lovely A.", password: "password123", email: "mahinay@gmail.com", gradeData: { attendance: 4.8, quizzes: 6.4, assignments: 3.2, ogr: 2.9, mte: 5.2, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024008", name: "Salimbagat, Roi Vincent D.", password: "password123", email: "salimbagat@gmail.com", gradeData: { attendance: 4.3, quizzes: 5, assignments: 2.6, ogr: 8.2, mte: 10.3, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024009", name: "Suarez, Reamie R.", password: "password123", email: "suarez@gmail.com", gradeData: { attendance: 4.5, quizzes: 4.9, assignments: 2.4, ogr: 2.9, mte: 8.6, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024010", name: "Taoy, Princess Ive L.", password: "password123", email: "taoy@gmail.com", gradeData: { attendance: 4, quizzes: 4.6, assignments: 2.2, ogr: 2.9, mte: 7.2, fe: 0, reporting: 0, fr: 0 } },
    { id: "2024011", name: "Yu, Ealaiza Bianca", password: "password123", email: "yu@gmail.com", gradeData: { attendance: 4.3, quizzes: 3.8, assignments: 2.5, ogr: 6.5, mte: 8.5, fe: 0, reporting: 0, fr: 0 } }
];

const INITIAL_ADMINS: Admin[] = [
    { id: "admin", name: "Roque M. Day", password: "admin123", email: "roque.day@nemsu.edu.ph" }
];

// --- LOCAL STORAGE HELPERS ---
const LS_KEY_STUDENTS = 'grademaster_students_v3';
const LS_KEY_ADMINS = 'grademaster_admins_v3';

const getLocalStudents = (): Student[] => {
    const stored = localStorage.getItem(LS_KEY_STUDENTS);
    if (!stored) {
        localStorage.setItem(LS_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
    }
    return JSON.parse(stored);
};

const saveLocalStudents = (students: Student[]) => {
    localStorage.setItem(LS_KEY_STUDENTS, JSON.stringify(students));
};

const getLocalAdmins = (): Admin[] => {
    const stored = localStorage.getItem(LS_KEY_ADMINS);
    if (!stored) {
        localStorage.setItem(LS_KEY_ADMINS, JSON.stringify(INITIAL_ADMINS));
        return INITIAL_ADMINS;
    }
    return JSON.parse(stored);
};

const saveLocalAdmins = (admins: Admin[]) => {
    localStorage.setItem(LS_KEY_ADMINS, JSON.stringify(admins));
};


// --- SUPABASE MAPPERS ---
const mapRowToStudent = (row: any): Student => {
  return {
    id: row.id,
    name: row.name,
    password: row.password,
    email: row.email,
    gradeData: {
      attendance: row.attendance || 0,
      quizzes: row.quizzes || 0,
      assignments: row.assignments || 0,
      ogr: row.ogr || 0,
      mte: row.mte || 0,
      fe: row.fe || 0,
      reporting: row.reporting || 0,
      fr: row.fr || 0
    }
  };
};

const mapStudentToRow = (student: Student) => {
  return {
    id: student.id,
    name: student.name,
    password: student.password,
    email: student.email,
    attendance: student.gradeData.attendance,
    quizzes: student.gradeData.quizzes,
    assignments: student.gradeData.assignments,
    ogr: student.gradeData.ogr,
    mte: student.gradeData.mte,
    fe: student.gradeData.fe,
    reporting: student.gradeData.reporting,
    fr: student.gradeData.fr
  };
};

// --- EXPORTED FUNCTIONS (HYBRID) ---

export const getStudents = async (): Promise<Student[]> => {
  if (!isSupabaseConfigured() || !supabase) {
      return getLocalStudents();
  }

  const { data, error } = await supabase.from('students').select('*').order('name');
  if (error) {
    console.error('Supabase getStudents error:', error.message);
    // Graceful fallback to local storage when Supabase is unreachable
    return getLocalStudents();
  }
  return data.map(mapRowToStudent);
};

export const addStudent = async (student: Student): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
      const students = getLocalStudents();
      if (students.some(s => s.id === student.id)) return false;
      students.push(student);
      saveLocalStudents(students);
      return true;
  }

  const row = mapStudentToRow(student);
  const { error } = await supabase.from('students').insert([row]);
  if (error) return false;
  return true;
};

export const updateStudentProfile = async (student: Student, originalId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
      const students = getLocalStudents();
      const targetId = originalId || student.id;
      
      // Check collision if ID changed
      if (originalId && originalId !== student.id) {
          if (students.some(s => s.id === student.id)) return false;
      }

      const index = students.findIndex(s => s.id === targetId);
      if (index === -1) return false;

      // Preserve grades, only update details
      students[index] = { ...students[index], name: student.name, id: student.id, email: student.email, password: student.password };
      saveLocalStudents(students);
      return true;
  }

  const targetId = originalId || student.id;
  const updates = { id: student.id, name: student.name, email: student.email, password: student.password };
  const { error } = await supabase.from('students').update(updates).eq('id', targetId);
  return !error;
};

export const updateStudentGrades = async (student: Student): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
      const students = getLocalStudents();
      const index = students.findIndex(s => s.id === student.id);
      if (index === -1) return false;
      
      students[index].gradeData = student.gradeData;
      saveLocalStudents(students);
      return true;
  }

  const updates = {
    attendance: student.gradeData.attendance,
    quizzes: student.gradeData.quizzes,
    assignments: student.gradeData.assignments,
    ogr: student.gradeData.ogr,
    mte: student.gradeData.mte,
    fe: student.gradeData.fe,
    reporting: student.gradeData.reporting,
    fr: student.gradeData.fr
  };
  const { error } = await supabase.from('students').update(updates).eq('id', student.id);
  return !error;
};

export const deleteStudent = async (id: string) => {
  if (!isSupabaseConfigured() || !supabase) {
      const students = getLocalStudents();
      const filtered = students.filter(s => s.id !== id);
      saveLocalStudents(filtered);
      return;
  }
  await supabase.from('students').delete().eq('id', id);
};

export const authenticateStudent = async (id: string, password: string): Promise<Student | undefined> => {
    if (!isSupabaseConfigured() || !supabase) {
        const students = getLocalStudents();
        return students.find(s => s.id === id && s.password === password);
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('password', password)
      .maybeSingle();

    if (error || !data) return undefined;
    return mapRowToStudent(data);
};

// --- ADMIN FUNCTIONS ---

export const getAdmins = async (): Promise<Admin[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return getLocalAdmins();
    }
    const { data } = await supabase.from('admins').select('*');
    return data || []; 
};

export const authenticateAdmin = async (id: string, password: string): Promise<Admin | undefined> => {
    if (!isSupabaseConfigured() || !supabase) {
        const admins = getLocalAdmins();
        return admins.find(a => a.id === id && a.password === password);
    }

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .eq('password', password)
      .maybeSingle();

    return error ? undefined : (data as Admin);
};

export const updateAdmin = async (updatedAdmin: Admin, originalId?: string): Promise<boolean> => {
    const targetId = originalId || updatedAdmin.id;
    
    if (!isSupabaseConfigured() || !supabase) {
        const admins = getLocalAdmins();
        const index = admins.findIndex(a => a.id === targetId);
        if (index === -1) return false;
        admins[index] = updatedAdmin;
        saveLocalAdmins(admins);
        return true;
    }

    const { error } = await supabase.from('admins').update(updatedAdmin).eq('id', targetId);
    return !error;
};

export const exportDatabase = async (): Promise<string> => {
    const students = await getStudents();
    return JSON.stringify({ students }, null, 2);
};

export const importDatabase = async (json: string): Promise<boolean> => {
    try {
        const parsed = JSON.parse(json);
        if (!parsed.students || !Array.isArray(parsed.students)) return false;

        if (!isSupabaseConfigured() || !supabase) {
            saveLocalStudents(parsed.students);
            return true;
        }

        // Upsert all students into Supabase
        const rows = parsed.students.map(mapStudentToRow);
        const { error } = await supabase.from('students').upsert(rows, { onConflict: 'id' });
        if (error) {
            console.error('Supabase importDatabase error:', error.message);
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

// --- REAL-TIME SUBSCRIPTIONS ---

/**
 * Subscribe to all changes in the students table.
 * Fires callback with a fresh sorted list on every INSERT / UPDATE / DELETE.
 * Returns an unsubscribe function – call it in a useEffect cleanup.
 */
export const subscribeToStudents = (
    callback: (students: Student[]) => void
): (() => void) => {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const channel = supabase
        .channel('students-all')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'students' },
            async () => {
                const { data, error } = await supabase!
                    .from('students')
                    .select('*')
                    .order('name');
                if (!error && data) callback(data.map(mapRowToStudent));
            }
        )
        .subscribe();

    return () => {
        supabase!.removeChannel(channel);
    };
};

/**
 * Subscribe to UPDATE events for a single student row.
 * Fires callback with the updated Student whenever the row changes.
 * Returns an unsubscribe function.
 */
export const subscribeToStudent = (
    id: string,
    callback: (student: Student) => void
): (() => void) => {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const channel = supabase
        .channel(`student-${id}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'students',
                filter: `id=eq.${id}`,
            },
            (payload) => {
                callback(mapRowToStudent(payload.new));
            }
        )
        .subscribe();

    return () => {
        supabase!.removeChannel(channel);
    };
};
