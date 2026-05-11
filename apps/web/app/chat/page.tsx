import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-">

     
      <div className="w-[1100px] h-[650px] bg-[#4a5975] rounded-md overflow-hidden shadow-2xl">

       
        <div className="h-[60px] bg-[#3f4b63] flex items-center justify-between px-6 text-white">

          <h1 className="font-semibold">
            Room:
          </h1>

          <h1 className="font-semibold">
            User:
          </h1>

          <Button className="bg-red-500 hover:bg-red-600">
            Leave Room
          </Button>
        </div>

       
        <div className="flex h-[calc(100%-60px)]">

       
          <div className="w-[90px] bg-[#000428]"></div>

        
          <div className="flex-1 flex flex-col justify-between">

            
            <div className="flex-1 p-5 overflow-y-auto"></div>

          
            <div className="p-4 bg-[#3f4b63] flex gap-3">

              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-[#1e293b] text-white px-4 py-3 rounded-md outline-none"
              />

              <Button className="bg-blue-500 hover:bg-blue-600">
                Send
              </Button>

            </div>
          </div>

          
          <div className="w-[90px] bg-[#000428]"></div>

        </div>
      </div>
    </div>
  );
}