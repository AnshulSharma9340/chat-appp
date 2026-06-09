// "use client";

// import { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   connectSocket,
//   subscribeToStatus,
//   subscribeToRoom,
//   sendMessage,
//   disconnectSocket,
// } from "@/lib/socket";
// import { api } from "@/lib/api";

// interface Message {
//   sender: string;
//   content: string;
//   timeStamp: string;
//   fileUrl?: string;
//   fileType?: string;
// }

// interface UserStatus {
//   userId: string;
//   online: boolean;
// }

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState("");
//   const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(new Map());
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // ✅ Fix: localStorage useEffect mein
//   const [currentUserId, setCurrentUserId] = useState("");
//   const [roomId, setRoomId] = useState("general");

//   useEffect(() => {
//     const userId = localStorage.getItem("userId") || "";
//     const room = localStorage.getItem("roomId") || "general";
//     setCurrentUserId(userId);
//     setRoomId(room);
//   }, []);

//   // ✅ Fix: Socket connect + subscribe
//   useEffect(() => {
//     if (!currentUserId) return;

//     connectSocket(currentUserId, () => {
//       // ✅ Doosre users ka status track karo
//       subscribeToStatus((status: UserStatus) => {
//         setOnlineUsers((prev) => {
//           console.log("Status received:", status);
//           const updated = new Map(prev);
//           updated.set(status.userId, status.online);
//           return updated;
//         });
//       });

//       // ✅ Room messages subscribe karo
//       subscribeToRoom(roomId, (message: Message) => {
//         setMessages((prev) => [...prev, message]);
//       });
//     });

//     return () => {
//       disconnectSocket();
//     };
//   }, [currentUserId, roomId]);

//   // ✅ Auto scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = () => {
//     if (!inputText.trim()) return;

//     sendMessage(roomId, {
//       sender: currentUserId,
//       content: inputText,
//     });

//     setInputText("");
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") handleSend();
//   };

// const handleLeaveRoom = async () => {

//     const token = localStorage.getItem("token");

//     await api.post(
//       "/auth/logout",
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     disconnectSocket();

//     localStorage.removeItem("userId");
//     localStorage.removeItem("roomId");
//     localStorage.removeItem("token");

//     window.location.href = "/login";
// };
//   // ✅ Online users count
 
//   const onlineCount = Array.from(onlineUsers.values()).filter(Boolean).length;

//   return (
//     <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
//       <div className="w-[1100px] h-[650px] bg-[#4a5975] rounded-md overflow-hidden shadow-2xl">

//         {/* Header */}
//         <div className="h-[60px] bg-[#3f4b63] flex items-center justify-between px-6 text-white">
//           <div>
//             <h1 className="font-semibold">Room: {roomId}</h1>
//             <p className="text-xs text-green-400">🟢 {onlineCount} Online</p>
//           </div>

//           <div className="text-center">
//             <h1 className="font-semibold">{currentUserId}</h1>
//             {/* ✅ Apna status — connected ho to online */}
//             <p className="text-sm text-green-400">🟢 Online</p>
//           </div>

//           <Button
//             className="bg-red-500 hover:bg-red-600"
//             onClick={handleLeaveRoom}
//           >
//             Leave Room
//           </Button>
//         </div>

//         <div className="flex h-[calc(100%-60px)]">
//           Left sidebar — online users list
//           <div className="w-[90px] bg-[#000428] flex flex-col items-center py-3 gap-2 overflow-y-auto">
//             {Array.from(onlineUsers.entries())
//   .filter(([_, online]) => online)
//   .map(([userId]) => (
//               <div key={userId} className="text-center">
//                 <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
//                   {userId.charAt(0).toUpperCase()}
//                 </div>
//                 <p className="text-[9px] text-gray-400 mt-1">
//                   {onlineUsers.get(userId) ? "🟢 Online" : "⚫ Offline"}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Chat area */}
//           <div className="flex-1 flex flex-col justify-between">
//             <div className="flex-1 p-5 overflow-y-auto text-white flex flex-col gap-2">
//               {messages.length === 0 && (
//                 <p className="text-gray-400 text-center mt-10">
//                   No messages yet. Say Hello! 👋
//                 </p>
//               )}

//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`flex ${
//                     msg.sender === currentUserId
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[60%] px-4 py-2 rounded-xl text-sm ${
//                       msg.sender === currentUserId
//                         ? "bg-blue-600 text-white"
//                         : "bg-[#1e293b] text-white"
//                     }`}
//                   >
//                     {msg.sender !== currentUserId && (
//                       <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>
//                     )}
//                     <p>{msg.content}</p>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input area */}
//             <div className="p-4 bg-[#3f4b63] flex gap-3">
//               <input
//                 type="text"
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Type a message..."
//                 className="flex-1 bg-[#1e293b] text-white px-4 py-3 rounded-md outline-none"
//               />
//               <Button
//                 className="bg-blue-500 hover:bg-blue-600"
//                 onClick={handleSend}
//               >
//                 Send
//               </Button>
//             </div>
//           </div>

//           {/* Right sidebar */}
//           <div className="w-[90px] bg-[#000428]"></div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import {
  connectSocket,
  subscribeToStatus,
  subscribeToRoom,
  sendMessage,
  disconnectSocket,
} from "@/lib/socket";
import { api } from "@/lib/api";
import { MdSend, MdLogout, MdAttachFile, MdMic, MdInsertEmoticon, MdClose, MdPeople } from "react-icons/md";
import EmojiPicker, { Theme } from "emoji-picker-react";

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
  const [currentUserId, setCurrentUserId] = useState("");
  const [roomId, setRoomId] = useState("general");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    const room = localStorage.getItem("roomId") || "general";
    setCurrentUserId(userId);
    setRoomId(room);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    connectSocket(currentUserId, () => {
      subscribeToStatus((status: UserStatus) => {
        setOnlineUsers((prev) => {
          const updated = new Map(prev);
          updated.set(status.userId, status.online);
          return updated;
        });
      });

      subscribeToRoom(roomId, (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [currentUserId, roomId]);

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
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const handleLeaveRoom = async () => {
    const token = localStorage.getItem("token");
    await api.post("/auth/logout", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    disconnectSocket();
    localStorage.removeItem("userId");
    localStorage.removeItem("roomId");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const onEmojiClick = (emojiData: any) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  const onlineCount = Array.from(onlineUsers.values()).filter(Boolean).length;

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-violet-500",
      "from-teal-500 to-blue-500",
      "from-pink-500 to-rose-500",
      "from-yellow-500 to-orange-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#111827]/80 to-[#1a1a2e]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-purple-500/20">
            #
          </div>
          <div>
            <h1 className="text-base font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Room: {roomId}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-400">{onlineCount} Online • {currentUserId}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLeaveRoom}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/20 px-4 py-2 rounded-xl transition-all duration-200 text-sm text-red-300 hover:text-red-200"
        >
          <MdLogout size={18} />
          Leave
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex relative z-10">

        {/* Left sidebar — Online users */}
        <div className="w-[80px] bg-white/[0.02] border-r border-white/5 flex-col items-center py-4 gap-3 overflow-y-auto hidden md:flex">
          <div className="flex items-center justify-center mb-2">
            <MdPeople size={20} className="text-gray-500" />
          </div>
          {Array.from(onlineUsers.entries())
            .filter(([_, online]) => online)
            .map(([userId]) => (
              <div key={userId} className="flex flex-col items-center gap-1 mb-1">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(userId)} flex items-center justify-center text-xs font-bold shadow-lg`}>
                  {userId.charAt(0).toUpperCase()}
                </div>
                <span className="text-[9px] text-gray-500 truncate max-w-[70px]">{userId}</span>
              </div>
            ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto pb-36">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/5">
                  <MdInsertEmoticon size={40} className="text-purple-400" />
                </div>
                <p className="text-gray-500 text-sm">No messages yet. Say hello! 👋</p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isMine = msg.sender === currentUserId;
              return (
                <div
                  key={index}
                  className={`flex mb-3 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMine && (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(msg.sender)} flex items-center justify-center text-xs font-bold mr-3 mt-auto shrink-0 shadow-lg`}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%]`}>
                    <span className={`text-[10px] text-gray-500 mb-1 px-1 ${isMine ? "text-right" : "text-left"}`}>
                      {msg.sender}
                    </span>

                    <div
                      className={`px-4 py-2.5 shadow-lg ${
                        isMine
                          ? "bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl rounded-br-md"
                          : "bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] rounded-2xl rounded-bl-md"
                      }`}
                    >
                      <p className="break-words text-sm leading-relaxed">{msg.content}</p>

                      {msg.fileType === "image" && msg.fileUrl && (
                        <img src={msg.fileUrl} alt="shared" className="mt-2 rounded-xl max-w-full max-h-80 object-cover" />
                      )}

                      {msg.fileType === "video" && msg.fileUrl && (
                        <video controls className="mt-2 rounded-xl max-w-full">
                          <source src={msg.fileUrl} type="video/mp4" />
                        </video>
                      )}

                      {msg.fileType === "audio" && msg.fileUrl && (
                        <audio controls className="mt-2 w-full">
                          <source src={msg.fileUrl} />
                        </audio>
                      )}

                      {msg.fileType === "file" && msg.fileUrl && (
                        <a href={msg.fileUrl} target="_blank"
                          className="flex items-center gap-2 mt-2 text-purple-300 hover:text-purple-200 underline underline-offset-2 text-sm">
                          <MdAttachFile size={16} />
                          Download File
                        </a>
                      )}
                    </div>

                    <span className={`text-[10px] text-gray-600 mt-1 px-2 ${isMine ? "text-right" : "text-left"}`}>
                      {msg.timeStamp
                        ? new Date(msg.timeStamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right sidebar — empty/reserved */}
        <div className="w-[80px] bg-white/[0.02] border-l border-white/5 hidden md:block" />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="fixed bottom-24 left-4 z-50">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme={Theme.DARK}
            width={340}
            height={400}
            searchPlaceholder="Search emoji..."
            skinTonesDisabled
          />
        </div>
      )}

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 w-full z-30 px-4" style={{ paddingTop: "24px", paddingBottom: "20px", background: "linear-gradient(to top, #0a0a0f, rgba(10,10,15,0.95), transparent)" }}>
        <div className="max-w-4xl mx-auto bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-xl shadow-black/20">
          <label className="cursor-pointer p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white shrink-0">
            <MdAttachFile size={22} />
            <input type="file" accept="image/*" hidden />
          </label>

          <button className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white shrink-0">
            <MdMic size={22} />
          </button>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition-all duration-200 shrink-0 ${
              showEmojiPicker ? "bg-white/10 text-white" : "hover:bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            <MdInsertEmoticon size={22} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-white text-sm px-3 placeholder-gray-500 min-w-0"
          />

          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 shrink-0"
          >
            <MdSend size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}