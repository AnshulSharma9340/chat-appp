"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      saveToken(res.data.token);

      // email save for socket presence
      localStorage.setItem("userId", email.toLowerCase());

      router.push("/");
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-[350px] space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="w-full border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-2"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          className="w-full border p-2"
          onClick={() => router.push("/signup")}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}