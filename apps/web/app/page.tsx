"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">

      {/* Main Container */}
      <div className="w-[900px] h-[500px] bg-[#031b46] rounded-md flex items-center justify-center shadow-2xl">

        {/* Card */}
        <div className="w-[420px] bg-[#1e293b] rounded-xl p-8 shadow-lg">

          {/* Heading */}
          <h2 className="text-white text-3xl font-bold text-center mb-8">
            Join Room...
          </h2>

          {/* Name */}
          <div className="mb-5">

            <label className="text-gray-300 text-sm mb-2 block">
              Your Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              className="w-full bg-[#334155] text-white px-4 py-3 rounded-md outline-none"
            />
          </div>

          {/* Room ID */}
          <div className="mb-8">

            <label className="text-gray-300 text-sm mb-2 block">
              Room ID
            </label>

            <input
              type="text"
              placeholder="Enter room ID"
              className="w-full bg-[#334155] text-white px-4 py-3 rounded-md outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">

            {/* Join Room */}
            <Button
              onClick={() => router.push("/joinroom")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
            >
              Join Room
            </Button>

            {/* Create Room */}
            <Button
              onClick={() => router.push("/joinroom")}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
            >
              Create Room
            </Button>

          </div>

        </div>
      </div>
    </div>
  );
}