
export interface GradeData {
  // Class Standing (30%)
  attendance: number;   // Max 5.0
  quizzes: number;      // Max 10.0
  assignments: number;  // Max 5.0
  ogr: number;          // Max 10.0 (Oral/Group Recitation)
  
  // Examinations (40%)
  mte: number;          // Max 20.0 (Midterm Exam)
  fe: number;           // Max 20.0 (Final Exam)
  
  // Requirements (30%)
  reporting: number;    // Max 15.0
  fr: number;           // Max 15.0 (Final Requirement)
}

export interface Student {
  id: string; // Used as login ID
  name: string;
  password: string;
  email?: string;
  gradeData: GradeData; // Stores the direct weighted score (e.g., 4.5 out of 5)
  aiSummary?: string; // Cache for AI generated summary
}

export interface Admin {
  id: string;
  name: string;
  password: string;
  email?: string;
}

export type UserRole = 'admin' | 'student' | null;

export interface UserSession {
  role: UserRole;
  studentId?: string; // Only if role is student
  adminId?: string;
}
