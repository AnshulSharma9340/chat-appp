"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { MdSend } from "react-icons/md";
import { uploadFile } from "@/lib/upload";
import EmojiPicker from "emoji-picker-react";
import { FaCamera } from "react-icons/fa";


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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioStreamRef =useRef<MediaStream | null>(null);
  const [playingAudio, setPlayingAudio] =useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasConnected = useRef(false);
  const mimeTypeRef = useRef<string>("");



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
      }else if (selectedFile.type.startsWith("audio/")) {
        fileType = "audio";
      }else {
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
  setShowEmojiPicker(false);
};
// Emoji click
const onEmojiClick = (emojiData: any) => {
  setInput((prev) => prev + emojiData.emoji);
};

  // Leave Room
  const leaveRoom = () => {
    localStorage.removeItem("username");

    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }

    router.push("/joinroom");
  };
  //logout room
  const logout = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("token"); 

  if (stompClient && stompClient.connected) {
    stompClient.disconnect();
  }

  router.push("/login");
};

// start recording

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    audioStreamRef.current = stream;

    // Fix 2: Browser support check — Safari/Firefox ke liye fallback
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"  // Safari fallback
      : "";

    mimeTypeRef.current = mimeType; // ref mein save karo

    const chunks: Blob[] = [];

    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : {} // agar mimeType empty hai toh default use ho
    );

    recorder.ondataavailable = (event) => {
      console.log("Chunk Size:", event.data.size);
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

recorder.onstop = () => {
  try {
    const audioBlob = new Blob(chunks, {
      type: mimeTypeRef.current || "audio/webm",
    });

    console.log("Audio Size:", audioBlob.size);
    console.log("Chunks:", chunks.length);

    if (audioBlob.size === 0) {
      alert("Recording failed. Please try again.");
      return;
    }

    const extension = (mimeTypeRef.current || "audio/webm").includes("mp4")
      ? "mp4" : "webm";

    const audioFile = new File(
      [audioBlob],
      `voice-${Date.now()}.${extension}`,
      { type: mimeTypeRef.current || "audio/webm" }
    );

    setSelectedFile(audioFile);

        // Fix 4: Memory leak — URL revoke karo audio ke baad
        const audioUrl = URL.createObjectURL(audioBlob);
        const testAudio = new Audio(audioUrl);

        testAudio.onended = () => URL.revokeObjectURL(audioUrl);

        testAudio.play().catch((err) => {
          console.log("Audio preview blocked:", err);
          URL.revokeObjectURL(audioUrl); // error pe bhi revoke karo
        });

      } finally {
        // Microphone tracks stop karo
        audioStreamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });
        audioStreamRef.current = null;
      }
    };

    recorder.onerror = (event) => {
      console.error("Recorder Error:", event);
    };

    recorder.start(1000);

    setMediaRecorder(recorder);
    setIsRecording(true);

  } catch (error) {
    console.error("Microphone Error:", error);
    alert("Microphone permission denied or microphone not available.");
  }
};

// ─── Stop Recording ─────────────────────────────────────────────
const stopRecording = () => {
  try {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop(); // ✅ bas stop, requestData() hata do
      setIsRecording(false);
    }
  } catch (error) {
    console.error("Stop Recording Error:", error);
    setIsRecording(false);
  }
};

//open camera..

const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Camera access denied or error occurred");
    }
  };
  //stop camera..
   const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `snap-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setSelectedFile(file);
      stopCamera();
    }, "image/jpeg");
  };


  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      
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
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg transition"
        >
          Leave Room
        </button>
        <button
    onClick={logout}
    className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg transition"
  >
    Logout
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
    {message.content.startsWith("http://") ||
     message.content.startsWith("https://") ? (
      <a
        href={message.content}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-300 underline"
      >
        {message.content}
      </a>
    ) : (
      message.content
    )}
  </p>
)}

              {message.fileType === "image" && message.fileUrl && (
                <img
                  src={message.fileUrl}
                  alt="shared"
                  className="mt-2 rounded-lg max-w-full"
                />
              )}

              {message.fileType === "video" && message.fileUrl && (
                <video
                  controls
                  className="mt-2 rounded-lg max-w-full"
                >
                  <source
                    src={message.fileUrl}
                    type="video/mp4"
                  />
                  Your browser does not support video.
                </video>
              )}

              {message.fileType === "audio" &&
  message.fileUrl && (
    <audio controls>
      <source
        src={message.fileUrl}
        type="audio/webm"
      />

    <button
  onClick={() => {
    const audio = document.getElementById(
      `audio-${index}`
    ) as HTMLAudioElement;

    if (playingAudio === index) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      audio.play();
      setPlayingAudio(index);

      audio.onended = () =>
        setPlayingAudio(null);
    }
  }}
  className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
>
  {playingAudio === index ? "⏸️" : "▶️"}
</button>

    <div className="flex-1">
      <div className="h-1 bg-gray-500 rounded-full"></div>
    </div>

    <span className="text-xs text-gray-300">
      🎤
    </span>
  </audio>
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

{showCamera && (
  <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-4">

    <video
      ref={videoRef}
      autoPlay
      className="w-[400px] rounded-lg"
    />

    <button
      onClick={capturePhoto}
      className="bg-blue-500 px-4 py-2 rounded"
    >
      Capture
    </button>

    <button
      onClick={() => setShowCamera(false)}
      className="bg-red-500 px-4 py-2 rounded"
    >
      Close
    </button>

  </div>
)}
      {/* Input */}
      <div className="fixed bottom-5 left-0 w-full px-4">
        <div className="max-w-4xl mx-auto bg-[#1e293b] rounded-full px-4 py-3 flex items-center gap-3 shadow-lg">

          <label className="cursor-pointer bg-slate-700 px-4 py-3 rounded-full">
  📎
  
  <input
    type="file"
    accept="image/*"
    hidden
    onChange={handleFileChange}
  />
</label>
<button
  type="button"
  onClick={startCamera}
  className="bg-slate-700 p-3 rounded-full"
>
   <FaCamera />
</button>
<button
  type="button"
  onClick={
    isRecording
      ? stopRecording
      : startRecording
  }
  className={`px-4 py-3 rounded-full transition ${
    isRecording
      ? "bg-red-500 animate-pulse"
      : "bg-slate-700"
  }`}
>
  {isRecording ? "⏹️" : "🎙️"}
</button>
{isRecording && (
  <div className="text-red-500 text-sm animate-pulse">
    🎤 Recording...
  </div>
)}

<button
  type="button"
  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
  className="bg-slate-700 px-4 py-3 rounded-full"
>
  😊
</button>
{showEmojiPicker && (
  <div className="absolute bottom-20 left-10 z-50">
    <EmojiPicker onEmojiClick={onEmojiClick} />
  </div>
)}

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






