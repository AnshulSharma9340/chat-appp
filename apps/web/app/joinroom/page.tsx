"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinRoomPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleJoinRoom = () => {

    if (!name || !roomId) return;

    // localStorage me save
    localStorage.setItem("username", name);

    // redirect
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">

      <div className="bg-slate-800 p-8 rounded-xl w-[400px]">

        <h1 className="text-white text-3xl font-bold mb-6 text-center">
          Join Room
        </h1>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-slate-700 text-white"
        />

        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full mb-6 p-3 rounded bg-slate-700 text-white"
        />

        <button
          onClick={handleJoinRoom}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded"
        >
          Join Room
        </button>

      </div>
    </div>
  );
}