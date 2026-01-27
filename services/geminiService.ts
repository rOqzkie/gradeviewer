
import { GoogleGenAI } from "@google/genai";
import { Student } from '../types';

// Use standard model for analysis
const MODEL_NAME = "gemini-2.5-flash";

export const generateStudentInsight = async (student: Student): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // MIDTERM FOCUSED PROMPT
    const prompt = `
      You are an encouraging academic advisor using the 'Class Record' grading system. 
      Analyze the student's MIDTERM performance. The values provided below are the ACTUAL POINTS earned out of the maximum points for that category.
      
      Student: ${student.name}
      
      Midterm Components:
      - Attendance: ${student.gradeData.attendance} / 5.0
      - Quizzes: ${student.gradeData.quizzes} / 10.0
      - Assignments: ${student.gradeData.assignments} / 5.0
      - Oral/Group Recitation: ${student.gradeData.ogr} / 10.0
      - Midterm Exam: ${student.gradeData.mte} / 20.0
      
      (Note: Final Exam, Reporting, and Final Requirement are not included in this Midterm assessment).

      Calculate the percentage performance for key areas in your head to give accurate advice.
      Provide a brief (max 3 sentences) summary. Identify the strongest area and the weakest area in the context of their midterm performance. Give specific advice on how to improve for the remaining term. Address the student directly.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Could not generate insight.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI service is currently unavailable. Please try again later.";
  }
};

export const generateStudyPlan = async (student: Student, category: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is missing.";
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Create a short, actionable study plan (3 bullet points) for ${student.name} to improve specifically in "${category}".
            The student's current score breakdown is: ${JSON.stringify(student.gradeData)}.
            Note that these values are weighted points, not percentages (e.g., 4/5 is 80%).
            This is for the Midterm period. Keep it encouraging.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });
        return response.text || "No plan generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Could not generate study plan.";
    }
}
