import { z } from 'zod';

// Student schema - validates individual student records
export const StudentSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  studentId: z.string().min(1).max(50),
  grade: z.string().min(1).max(50),
  gender: z.string().max(20).optional().default(""),
  status: z.string().max(50).optional().default(""),
  photo: z.string().max(10000).optional(),
  createdAt: z.string().min(1)
}).strict();

// Attendance record schema
export const AttendanceRecordSchema = z.object({
  id: z.string().min(1).max(100),
  studentId: z.string().min(1).max(50),
  studentName: z.string().max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().min(1),
  timestamp: z.number()
}).strict();

// Database export schema
export const DatabaseExportSchema = z.object({
  students: z.array(StudentSchema).max(10000),
  attendance: z.array(AttendanceRecordSchema).max(100000),
  exportDate: z.string().min(1),
  version: z.string().min(1)
}).strict();

// Activation data schema
export const ActivationDataSchema = z.object({
  schoolName: z.string().min(1).max(100),
  licenseKey: z.string().min(1).max(100),
  expiryDate: z.string().min(1),
  features: z.array(z.string().max(50)).max(20)
}).strict();

// Helper function to validate and parse database export
export const validateDatabaseExport = (data: unknown): z.infer<typeof DatabaseExportSchema> => {
  return DatabaseExportSchema.parse(data);
};

// Helper function to validate activation data
export const validateActivationData = (data: unknown): z.infer<typeof ActivationDataSchema> => {
  return ActivationDataSchema.parse(data);
};

// Safe JSON parse with validation - throws error string on failure
export const parseAndValidateJSON = <T>(
  jsonString: string,
  schema: z.ZodSchema<T>
): T => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("ملف JSON غير صالح");
  }
  
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error("البيانات لا تتطابق مع التنسيق المطلوب");
  }
  
  return result.data;
};

// Validate already-parsed data
export const validateData = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error("البيانات لا تتطابق مع التنسيق المطلوب");
  }
  return result.data;
};
