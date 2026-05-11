"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { MdSend } from "react-icons/md";

type Message = {
  sender: string;
  content: string;
  roomId: string;
};

export default function ChatPage() {

  const router = useRouter();

  const params = useParams();

  const roomId = params.id;

  // Username State
  const [username, setUsername] = useState("");

  // Load Username From LocalStorage
  useEffect(() => {

    const storedUsername = localStorage.getItem("username");

    if (storedUsername) {
      setUsername(storedUsername);
    }

  }, []);

  const [stompClient, setStompClient] = useState<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  // WebSocket Connection
  useEffect(() => {

    if (!roomId) return;

    const socket = new SockJS("http://localhost:8080/chat");

    const stomp = Stomp.over(socket);

    stomp.connect({}, () => {

      console.log("Connected");

      setStompClient(stomp);

      // Subscribe Room
      stomp.subscribe(`/topic/room/${roomId}`, (message) => {

        const newMessage = JSON.parse(message.body);

        setMessages((prev) => [...prev, newMessage]);

      });

    });

    // Cleanup
    return () => {
      stomp.disconnect();
    };

  }, [roomId]);

  // Send Message
  const sendMessage = () => {

    if (!input.trim()) return;

    if (!stompClient) return;

    const message = {
      sender: username,
      content: input,
      roomId: roomId,
    };

    stompClient.send(
      `/app/sendMessage/${roomId}`,
      {},
      JSON.stringify(message)
    );

    setInput("");
  };

  // Leave Room
  const leaveRoom = () => {

    localStorage.removeItem("username");

    router.push("/joinroom");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">

      {/* Header */}
      <div className="bg-[#1e293b] px-8 py-5 flex justify-between items-center shadow-lg">

        <h1 className="text-xl font-bold">
          Room : {roomId}
        </h1>

        <h1 className="text-lg">
          User : {username}
        </h1>

        <button
          onClick={leaveRoom}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg"
        >
          Leave Room
        </button>

      </div>

      {/* Messages */}
      <div className="max-w-5xl mx-auto p-5 h-[80vh] overflow-y-auto">

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
              className={`px-4 py-3 rounded-xl max-w-[300px] ${
                message.sender === username
                  ? "bg-blue-500"
                  : "bg-slate-700"
              }`}
            >

              <p className="font-bold text-sm mb-1">
                {message.sender}
              </p>

              <p>
                {message.content}
              </p>

            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="fixed bottom-5 left-0 w-full">

        <div className="max-w-4xl mx-auto bg-[#1e293b] rounded-full px-4 py-3 flex items-center gap-3">

          <input
            type="text"
            placeholder="Type message..."
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
            className="bg-blue-500 hover:bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center"
          >
            <MdSend size={22} />
          </button>

        </div>
      </div>
    </div>
  );
}