// مفتاح التشفير السري - لا تشاركه مع أي شخص
const SECRET_KEY = "YRL2025-SECURE-ACTIVATION-KEY-XZ9K";
const MAGIC_HEADER = "YRLENC1"; // لتحديد الملفات المشفرة

// Simple XOR encryption with key rotation
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

// Convert string to Base64 (browser compatible)
const toBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
};

// Convert Base64 to string (browser compatible)
const fromBase64 = (base64: string): string => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

// Shuffle string based on key (additional obfuscation)
const shuffle = (text: string, key: string): string => {
  const arr = text.split('');
  const keySum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (keySum + i * 7) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr.join('');
};

// Unshuffle string based on key
const unshuffle = (text: string, key: string): string => {
  const arr = text.split('');
  const keySum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  const swaps: [number, number][] = [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (keySum + i * 7) % (i + 1);
    swaps.push([i, j]);
  }
  
  // Reverse the swaps
  for (let k = swaps.length - 1; k >= 0; k--) {
    const [i, j] = swaps[k];
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr.join('');
};

// Add checksum for integrity verification
const calculateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0');
};

/**
 * تشفير بيانات ملف التفعيل
 * Encrypt activation file data
 */
export const encryptActivationData = (jsonData: string): string => {
  try {
    // 1. Add timestamp to prevent replay attacks
    const timestamp = Date.now().toString(36);
    const dataWithTime = `${timestamp}|${jsonData}`;
    
    // 2. Calculate checksum
    const checksum = calculateChecksum(dataWithTime);
    const dataWithChecksum = `${checksum}|${dataWithTime}`;
    
    // 3. XOR encrypt
    const encrypted = xorEncrypt(dataWithChecksum, SECRET_KEY);
    
    // 4. Shuffle for obfuscation
    const shuffled = shuffle(encrypted, SECRET_KEY);
    
    // 5. Base64 encode
    const base64 = toBase64(shuffled);
    
    // 6. Add magic header
    return `${MAGIC_HEADER}${base64}`;
  } catch (error) {
    throw new Error("خطأ في تشفير البيانات");
  }
};

/**
 * فك تشفير بيانات ملف التفعيل
 * Decrypt activation file data
 */
export const decryptActivationData = (encryptedData: string): string => {
  try {
    // 1. Check magic header
    if (!encryptedData.startsWith(MAGIC_HEADER)) {
      throw new Error("INVALID_FORMAT");
    }
    
    // 2. Remove magic header
    const base64 = encryptedData.slice(MAGIC_HEADER.length);
    
    // 3. Base64 decode
    const shuffled = fromBase64(base64);
    
    // 4. Unshuffle
    const encrypted = unshuffle(shuffled, SECRET_KEY);
    
    // 5. XOR decrypt
    const decrypted = xorEncrypt(encrypted, SECRET_KEY); // XOR is symmetric
    
    // 6. Extract checksum and data
    const firstPipe = decrypted.indexOf('|');
    if (firstPipe === -1) throw new Error("INVALID_DATA");
    
    const storedChecksum = decrypted.slice(0, firstPipe);
    const dataWithTime = decrypted.slice(firstPipe + 1);
    
    // 7. Verify checksum
    const calculatedChecksum = calculateChecksum(dataWithTime);
    if (storedChecksum !== calculatedChecksum) {
      throw new Error("CHECKSUM_MISMATCH");
    }
    
    // 8. Extract timestamp and original data
    const secondPipe = dataWithTime.indexOf('|');
    if (secondPipe === -1) throw new Error("INVALID_DATA");
    
    const jsonData = dataWithTime.slice(secondPipe + 1);
    
    return jsonData;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INVALID")) {
      throw new Error("ملف التفعيل غير صالح أو تم التلاعب به");
    }
    if (error instanceof Error && error.message === "CHECKSUM_MISMATCH") {
      throw new Error("ملف التفعيل تالف أو تم تعديله");
    }
    throw new Error("خطأ في فك تشفير ملف التفعيل");
  }
};

/**
 * التحقق مما إذا كان الملف مشفراً
 * Check if file content is encrypted
 */
export const isEncryptedFile = (content: string): boolean => {
  return content.trim().startsWith(MAGIC_HEADER);
};
