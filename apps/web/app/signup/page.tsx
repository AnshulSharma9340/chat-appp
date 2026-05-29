"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Signup successful. Please login.");
      router.push("/login");

    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-[350px] space-y-4">
        <h1 className="text-2xl font-bold">Signup</h1>

        <input
          className="w-full border p-2"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-black text-white p-2"
          onClick={handleSignup}
        >
          Signup
        </button>
      </div>
    </div>
  );
}