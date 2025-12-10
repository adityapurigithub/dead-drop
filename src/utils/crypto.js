/* ----------------------------------------------------
 * 1. Generate a random AES-GCM 256-bit key
 * ----------------------------------------------------
 * - AES-GCM is secure and built into the browser.
 * - `generateKey` returns a CryptoKey (not a string).
 * - This key is later exported to Base64 to put in the URL.
 ---------------------------------------------------- */
export const generateKey = async () => {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256, // 256-bit key strength
    },
    true,           // key can be exported later
    ["encrypt", "decrypt"]
  );
};

/* ----------------------------------------------------
 * 2. Encrypt a file using AES-GCM
 * ----------------------------------------------------
 * Steps:
 *  A. Create IV (Initialization Vector)
 *     - 12 bytes recommended for AES-GCM
 *     - Must be unique per encryption
 *
 *  B. Convert the file to ArrayBuffer
 *
 *  C. Encrypt using key + IV
 *
 *  D. Return:
 *     - encryptedBlob → upload to server
 *     - iv → needed later for decryption
 ---------------------------------------------------- */
export const encryptFile = async (file, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // random 96-bit IV
  const arrayBuffer = await file.arrayBuffer();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    arrayBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    iv,
  };
};

/* ----------------------------------------------------
 * 3. Export CryptoKey → Base64 string
 * ----------------------------------------------------
 * Why?
 * - CryptoKey objects cannot be stored in URLs.
 * - So we export the raw bytes → then convert to Base64.
 *
 * Example output:
 *   "Ax94kL5N2smu4cYh3jDg8+w2Hb=="
 ---------------------------------------------------- */
export const exportKey = async (key) => {
  const rawKey = await crypto.subtle.exportKey("raw", key);

  // Convert bytes → binary string → base64
  return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
};

/* ----------------------------------------------------
 * 4. Import Base64 string → CryptoKey
 * ----------------------------------------------------
 * Reverse of exportKey():
 *   Base64 → binary string → Uint8Array → CryptoKey
 ---------------------------------------------------- */
export const importKey = async (keyString) => {
  const binaryString = atob(keyString);
  const bytes = Uint8Array.from(binaryString, (char) =>
    char.charCodeAt(0)
  );

  return crypto.subtle.importKey(
    "raw",
    bytes,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
};

/* ----------------------------------------------------
 * 5. Decrypt encrypted file buffer
 * ----------------------------------------------------
 * Inputs:
 *  - encryptedBuffer → data received from server
 *  - key → imported from Base64 string in URL
 *  - iv → returned via server response headers
 *
 * Returns:
 *  - A Blob (original file restored)
 *
 * Note:
 *  If key or IV is wrong → AES-GCM throws an error.
 ---------------------------------------------------- */
export const decryptFile = async (encryptedBuffer, key, iv) => {
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
};
