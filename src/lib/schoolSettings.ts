import { z } from 'zod';
import { encryptActivationData, decryptActivationData, isEncryptedFile } from './encryption';

// Schema for school settings from activation file
export const SchoolSettingsSchema = z.object({
  schoolName: z.string().min(1).max(200),
  wilaya: z.string().min(1).max(100),
  commune: z.string().min(1).max(100),
  directionName: z.string().max(200).optional().default(""),
  schoolYear: z.string().max(20).optional().default("2025/2026"),
  activatedAt: z.string().optional(),
  licenseKey: z.string().min(1).max(100).optional(),
  expiryDate: z.string().optional(), // تاريخ انتهاء الصلاحية YYYY-MM-DD
});

export type SchoolSettings = z.infer<typeof SchoolSettingsSchema>;

const STORAGE_KEY = "school_settings";

// Default settings
export const defaultSettings: SchoolSettings = {
  schoolName: "مدرسة",
  wilaya: "",
  commune: "",
  directionName: "",
  schoolYear: "2025/2026",
};

// Get current school settings
export const getSchoolSettings = (): SchoolSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validated = SchoolSettingsSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    }
  } catch (error) {
    console.error("Error loading school settings:", error);
  }
  return defaultSettings;
};

// Save school settings
export const saveSchoolSettings = (settings: SchoolSettings): void => {
  try {
    const validated = SchoolSettingsSchema.parse(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  } catch (error) {
    console.error("Error saving school settings:", error);
    throw new Error("خطأ في حفظ الإعدادات");
  }
};

// Import settings from activation file (supports both encrypted and plain JSON)
export const importActivationFile = (fileContent: string): SchoolSettings => {
  try {
    let jsonContent = fileContent;
    
    // Check if file is encrypted
    if (isEncryptedFile(fileContent)) {
      jsonContent = decryptActivationData(fileContent);
    }
    
    const data = JSON.parse(jsonContent);
    const validated = SchoolSettingsSchema.parse({
      ...data,
      activatedAt: new Date().toISOString(),
    });
    saveSchoolSettings(validated);
    return validated;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ملف التفعيل")) {
      throw error; // Re-throw encryption errors as-is
    }
    if (error instanceof z.ZodError) {
      throw new Error("ملف التفعيل غير صالح - تأكد من التنسيق الصحيح");
    }
    throw new Error("خطأ في قراءة ملف التفعيل");
  }
};

// Check if license is expired
export const isLicenseExpired = (): boolean => {
  const settings = getSchoolSettings();
  if (!settings.expiryDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(settings.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  return today > expiry;
};

// Get days until expiry
export const getDaysUntilExpiry = (): number | null => {
  const settings = getSchoolSettings();
  if (!settings.expiryDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(settings.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Check if app is activated (and not expired)
export const isActivated = (): boolean => {
  const settings = getSchoolSettings();
  const hasRequiredFields = !!(settings.schoolName && settings.wilaya && settings.commune);
  return hasRequiredFields && !isLicenseExpired();
};

// Check if app has valid activation data (regardless of expiry)
export const hasActivationData = (): boolean => {
  const settings = getSchoolSettings();
  return !!(settings.schoolName && settings.wilaya && settings.commune);
};

// Generate encrypted activation file content (for admin use)
export const generateActivationFile = (settings: Omit<SchoolSettings, 'activatedAt'>): string => {
  const data = {
    ...settings,
    licenseKey: `YRL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
  };
  const jsonData = JSON.stringify(data);
  return encryptActivationData(jsonData);
};

// Get full direction title
export const getDirectionTitle = (): string => {
  const settings = getSchoolSettings();
  if (settings.wilaya) {
    return `مديرية التربية لولاية ${settings.wilaya}`;
  }
  return "مديرية التربية";
};

// Get full school header for documents
export const getDocumentHeader = () => {
  const settings = getSchoolSettings();
  return {
    republic: "الجمهورية الجزائرية الديمقراطية الشعبية",
    ministry: "وزارة التربية الوطنية",
    direction: settings.wilaya ? `مديرية التربية لولاية ${settings.wilaya}` : "مديرية التربية",
    school: settings.schoolName,
    commune: settings.commune,
    schoolYear: settings.schoolYear,
  };
};
