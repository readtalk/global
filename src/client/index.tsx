import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil JWT dari URL (setelah redirect dari OAuth)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || localStorage.getItem("token");

    if (token) {
      localStorage.setItem("token", token);
      // 2. Verifikasi token ke server (opsional, untuk ambil data user)
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token invalid");
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(() => {
          // Token invalid, hapus dan redirect ke login
          localStorage.removeItem("token");
          window.location.href = "/authorize";
        });
    } else {
      // Tidak ada token, redirect ke login
      window.location.href = "/authorize";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Hapus cookie jika ada
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/authorize";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "20px", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
        <h2>Welcome, {user?.email || user?.id}!</h2>
        <p>User ID: {user?.id}</p>
        <p>Email: {user?.email || "Not provided"}</p>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "16px",
            background: "#FF0000",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
