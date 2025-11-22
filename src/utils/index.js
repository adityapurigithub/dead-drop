// src/utils/crypto.js

// 1. Generate a random 256-bit key for AES-GCM
export const generateKey = async () => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // Extractable (we need to show it to the user in the link)
    ["encrypt", "decrypt"]
  );
};

// 2. Encrypt the file
export const encryptFile = async (file, key) => {
  // Generate a random Initialization Vector (IV) - required for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Perform the encryption
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer]), // The data to send to server
    iv: iv, // We need to send this to server too (it's public, not secret)
  };
};

// 3. Export Key to String (Base64) so we can put it in the URL
export const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};
