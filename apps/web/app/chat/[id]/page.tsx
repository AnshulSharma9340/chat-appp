"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { MdSend } from "react-icons/md";
import { uploadFile } from "@/lib/upload";

type Message = {
  sender: string;
  content: string;
  roomId?: string;
  timeStamp: string;
  fileUrl?: string;
  fileType?: string;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id;

  const [username, setUsername] = useState("");
  const [stompClient, setStompClient] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasConnected = useRef(false);

  // Load username
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.push("/joinroom");
    }
  }, [router]);

  // WebSocket Connection
  useEffect(() => {
    if (!roomId || !username || hasConnected.current) return;

    hasConnected.current = true;

    const socket = new SockJS("http://localhost:8080/chat");
    const stomp = Stomp.over(socket);

    stomp.debug = () => {};

    let subscription: any = null;

    stomp.connect({}, () => {
      console.log("Connected to chat");

      setStompClient(stomp);

      subscription = stomp.subscribe(
        `/topic/room/${roomId}`,
        (message) => {
          const newMessage: Message = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);
        }
      );
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }

      if (stomp.connected) {
        stomp.disconnect();
      }

      hasConnected.current = false;
    };
  }, [roomId, username]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // File select
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Send Message
  // const sendMessage = async () => {
  //   if (!stompClient || !username) return;

  //   let fileUrl = "";
  //   let fileType = "";

  //   // Upload file if selected
  //   if (selectedFile) {
  //     try {
  //       fileUrl = await uploadFile(selectedFile);

  //       if (selectedFile.type.startsWith("image/")) {
  //         fileType = "image";
  //       } else if (selectedFile.type.startsWith("video/")) {
  //         fileType = "video";
  //       } else {
  //         fileType = "file";
  //       }
  //     } catch (error) {
  //       alert("File upload failed");
  //       return;
  //     }
  //   }

  //   if (!input.trim() && !fileUrl) return;

  //   const message = {
  //     sender: username,
  //     content: input,
  //     roomId: roomId,
  //     fileUrl,
  //     fileType,
  //   };

  //   stompClient.send(
  //     `/app/sendMessage/${roomId}`,
  //     {},
  //     JSON.stringify(message)
  //   );

  //   setInput("");
  //   setSelectedFile(null);
  // };
  const sendMessage = async () => {
  if (!stompClient || !stompClient.connected || !username) {
    alert("WebSocket not connected yet");
    return;
  }

  let fileUrl = "";
  let fileType = "";

  if (selectedFile) {
    try {
      fileUrl = await uploadFile(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        fileType = "image";
      } else if (selectedFile.type.startsWith("video/")) {
        fileType = "video";
      } else {
        fileType = "file";
      }
    } catch (error) {
      alert("File upload failed");
      return;
    }
  }

  if (!input.trim() && !fileUrl) return;

  const message = {
    sender: username,
    content: input,
    roomId: roomId,
    fileUrl,
    fileType,
  };

  try {
    stompClient.send(
      `/app/sendMessage/${roomId}`,
      {},
      JSON.stringify(message)
    );
  } catch (err) {
    console.error("Send message error:", err);
    return;
  }

  setInput("");
  setSelectedFile(null);
};

  // Leave Room
  const leaveRoom = () => {
    localStorage.removeItem("username");

    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }

    router.push("/joinroom");
  };


  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      
      {/* Header */}
      <div className="bg-[#1e293b] px-8 py-5 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">
          Room : {roomId}
        </h1>
        {/* <div className="text-sm text-green-400">
          <p className="text-sm text-green-400">
            Connected 
          </p>
          <p className="text-xs text-gray-300">
            online
            </p>
        </div> */}

        <h1 className="text-lg">
          User : {username}
        </h1>

        <button
          onClick={leaveRoom}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg transition"
        >
          Leave Room
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-5 overflow-y-auto pb-32">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              message.sender === username
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl max-w-[320px] shadow-md ${
                message.sender === username
                  ? "bg-blue-500"
                  : "bg-slate-700"
              }`}
            >
              <p className="font-bold text-sm mb-1">
                {message.sender}
              </p>

              {message.content && (
                <p className="break-words">
                  {message.content}
                </p>
              )}

              {message.fileType === "image" && message.fileUrl && (
                <img
                  src={message.fileUrl}
                  alt="shared"
                  className="mt-2 rounded-lg max-w-full"
                />
              )}

              {message.fileType === "file" && message.fileUrl && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  className="text-yellow-300 underline mt-2 block"
                >
                  Download File
                </a>
              )}

              <p className="text-xs text-gray-200 mt-2 text-right">
                {message.timeStamp
                  ? new Date(message.timeStamp).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )
                  : ""}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-5 left-0 w-full px-4">
        <div className="max-w-4xl mx-auto bg-[#1e293b] rounded-full px-4 py-3 flex items-center gap-3 shadow-lg">

          <label className="cursor-pointer bg-slate-700 px-4 py-3 rounded-full">
            📎
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </label>

          <input
            type="text"
            placeholder={
              selectedFile
                ? `Selected: ${selectedFile.name}`
                : "Type message..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="flex-1 bg-transparent outline-none text-white px-4"
          />

          <button
            onClick={sendMessage}
            aria-label="Send Message"
            className="bg-blue-500 hover:bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center transition"
          >
            <MdSend size={22} />
          </button>

        </div>
      </div>
    </div>
  );
}