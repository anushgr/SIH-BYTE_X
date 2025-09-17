"use client";
import React, { useState } from "react";

const encrypted = "U29sdmluZyByYWluIGNoYWxsZW5nZXMgdG9nZXRoZXIh"; // base64 for 'Solving rain challenges together!'

function decrypt(text: string) {
  try {
    return atob(text);
  } catch {
    return "[Decryption failed]";
  }
}

export const DecryptedText: React.FC = () => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold hover:opacity-80 transition"
        onClick={() => setShow((s) => !s)}
      >
        {show ? "Hide Decrypted Text" : "Show Decrypted Text"}
      </button>
      {show && (
        <div className="mt-2 text-lg font-mono text-gray-800 dark:text-gray-200">
          {decrypt(encrypted)}
        </div>
      )}
    </div>
  );
};
