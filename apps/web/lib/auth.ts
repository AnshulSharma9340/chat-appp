// export const saveToken = (token: string) => {
//   localStorage.setItem("token", token);
// };

// export const getToken = () => {
//   return localStorage.getItem("token");
// };

// export const logout = () => {
//   localStorage.removeItem("token");
// };
import { disconnectSocket } from "@/lib/socket";

// ✅ Token save karo
export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

// ✅ Token get karo
export const getToken = () => {
  return localStorage.getItem("token");
};

// ✅ UserId save karo (login ke baad call karo)
export const saveUserId = (userId: string) => {
  localStorage.setItem("userId", userId);
};

// ✅ UserId get karo
export const getUserId = () => {
  return localStorage.getItem("userId");
};

// ✅ Check karo logged in hai ya nahi
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("token");
};

// ✅ Pura logout — WebSocket + localStorage clear + redirect
export const logout = async () => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  try {
    await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  // ✅ WebSocket disconnect
  disconnectSocket();

  // ✅ Sab kuch clear karo
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("roomId");

  // ✅ Login page pe redirect
  window.location.href = "/login";
};