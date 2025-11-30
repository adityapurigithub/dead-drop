// src/utils/crypto.js

// 1. Generate a random 256-bit key for AES-GCM
export const generateKey = async () => {
  // window.crypto.subtle is the native browser API for cryptography
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM", // The Algorithm: Advanced Encryption Standard in Galois/Counter Mode
      length: 256,     // The Strength: 256-bit is military-grade standard
    },
    true, // Extractable: TRUE means we are allowed to export this key to a string later (to put in the URL)
    ["encrypt", "decrypt"] // Allowed Usages: This key can do both
  );
};
// 2. Encrypt the file
export const encryptFile = async (file, key) => {
  // A. Generate the IV (Initialization Vector)
  // Why? If you encrypt the same file twice with the same key, the output looks identical.
  // The IV adds randomness so every encryption looks unique. It is PUBLIC (safe to send to server).
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // B. Convert File to Math-friendly format
  // Browsers read files as 'Blobs', but Crypto needs 'ArrayBuffer' (Raw Binary 1s and 0s)
  const arrayBuffer = await file.arrayBuffer();

  // C. The Magic Trick
  // This runs the AES-GCM math using the Key and IV on the file data.
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  // D. Package it up
  // We return the encrypted data as a 'Blob' (so it's easy to upload)
  // We ALSO return the 'iv', because the downloader needs it to unlock the file.
  return {
    encryptedBlob: new Blob([encryptedBuffer]), 
    iv: iv, 
  };
};
// 3. Export Key to String (Base64) so we can put it in the URL
export const exportKey = async (key) => {
  // A. Export to Raw Binary
  // Takes the Browser Key Object and turns it into raw binary data
  const exported = await window.crypto.subtle.exportKey("raw", key);
  
  // B. Convert Binary to Base64 String
  // 'btoa' stands for "Binary to ASCII". 
  // It turns weird binary symbols into safe letters/numbers (A-Z, 0-9) that fit in a URL.
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};


// ... existing code ...

// 4. Import Key from String (Restore key from URL)
export const importKey = async (keyString) => {
  // A. Convert Base64 String back to Binary String
  // 'atob' stands for "ASCII to Binary"
  const binaryString = atob(keyString);
  
  // B. Convert Binary String to Uint8Array (Computer Numbers)
  // We loop through the string and turn every character back into a byte number (0-255)
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // C. Re-create the Key Object
  // We tell the browser: "Take these raw bytes and treat them as an AES-GCM key again."
  return window.crypto.subtle.importKey(
    "raw",
    bytes,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
};

// 5. Decrypt the File
export const decryptFile = async (encryptedBuffer, key, iv) => {
  // A. Run the Decryption Math
  // We feed it the Scrambled Data, the Key (from URL), and the IV (from Server Headers)
  // If the Key or IV is wrong, this line will crash (throw an error).
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedBuffer
  );

  // B. Convert back to Blob
  // The result is raw binary. We wrap it in a 'Blob' so the browser can download it as a file.
  return new Blob([decryptedBuffer]);
};