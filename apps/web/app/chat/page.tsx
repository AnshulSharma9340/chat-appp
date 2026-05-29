"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  connectSocket,
  subscribeToStatus,
  subscribeToRoom,
  sendMessage,
  disconnectSocket,
} from "@/lib/socket";
import { api } from "@/lib/api";

interface Message {
  sender: string;
  content: string;
  timeStamp: string;
  fileUrl?: string;
  fileType?: string;
}

interface UserStatus {
  userId: string;
  online: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Fix: localStorage useEffect mein
  const [currentUserId, setCurrentUserId] = useState("");
  const [roomId, setRoomId] = useState("general");

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    const room = localStorage.getItem("roomId") || "general";
    setCurrentUserId(userId);
    setRoomId(room);
  }, []);

  // ✅ Fix: Socket connect + subscribe
  useEffect(() => {
    if (!currentUserId) return;

    connectSocket(currentUserId, () => {
      // ✅ Doosre users ka status track karo
      subscribeToStatus((status: UserStatus) => {
        setOnlineUsers((prev) => {
          console.log("Status received:", status);
          const updated = new Map(prev);
          updated.set(status.userId, status.online);
          return updated;
        });
      });

      // ✅ Room messages subscribe karo
      subscribeToRoom(roomId, (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [currentUserId, roomId]);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    sendMessage(roomId, {
      sender: currentUserId,
      content: inputText,
    });

    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

const handleLeaveRoom = async () => {

    const token = localStorage.getItem("token");

    await api.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    disconnectSocket();

    localStorage.removeItem("userId");
    localStorage.removeItem("roomId");
    localStorage.removeItem("token");

    window.location.href = "/login";
};
  // ✅ Online users count
  const onlineCount = Array.from(onlineUsers.values()).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-[1100px] h-[650px] bg-[#4a5975] rounded-md overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="h-[60px] bg-[#3f4b63] flex items-center justify-between px-6 text-white">
          <div>
            <h1 className="font-semibold">Room: {roomId}</h1>
            <p className="text-xs text-green-400">🟢 {onlineCount} Online</p>
          </div>

          <div className="text-center">
            <h1 className="font-semibold">{currentUserId}</h1>
            {/* ✅ Apna status — connected ho to online */}
            <p className="text-sm text-green-400">🟢 Online</p>
          </div>

          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
        </div>

        <div className="flex h-[calc(100%-60px)]">
          {/* Left sidebar — online users list */}
          <div className="w-[90px] bg-[#000428] flex flex-col items-center py-3 gap-2 overflow-y-auto">
            {Array.from(onlineUsers.entries()).map(([userId, online]) => (
              <div key={userId} className="text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {userId.charAt(0).toUpperCase()}
                </div>
                <p className="text-[9px] text-gray-400 mt-1">
                  {onlineUsers.get(userId) ? "🟢 Online" : "⚫ Offline"}
                </p>
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex-1 p-5 overflow-y-auto text-white flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center mt-10">
                  No messages yet. Say Hello! 👋
                </p>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === currentUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] px-4 py-2 rounded-xl text-sm ${
                      msg.sender === currentUserId
                        ? "bg-blue-600 text-white"
                        : "bg-[#1e293b] text-white"
                    }`}
                  >
                    {msg.sender !== currentUserId && (
                      <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>
                    )}
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-[#3f4b63] flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-[#1e293b] text-white px-4 py-3 rounded-md outline-none"
              />
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleSend}
              >
                Send
              </Button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-[90px] bg-[#000428]"></div>
        </div>
      </div>
    </div>
  );
}