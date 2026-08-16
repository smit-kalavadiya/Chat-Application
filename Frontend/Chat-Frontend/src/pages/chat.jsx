import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";
import { validateToken } from "../Utils/Auth";

let stompClient = null;

export default function Chat() {
  
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ decoded: { sub: "" } });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Validate token
  useEffect(() => {
    const result = validateToken(navigate);
    if (result && result.decoded?.sub) {
      setAuth(result);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !auth.decoded?.sub) return;

    stompClient = new Client({
      brokerURL: "ws://10.0.0.217:8082/chat",
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        stompClient.subscribe("/topic/messages", (msg) => {
          try {
            const body = JSON.parse(msg.body);
            setMessages((prev) => [...prev, body]);
          } catch (err) {
            console.error("Failed to parse message:", err);
          }
        });
      },
      onStompError: (frame) => console.error("STOMP error:", frame.headers.message),
    });

    stompClient.activate();
    return () => stompClient?.deactivate();
  }, [auth.decoded?.sub]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !auth.decoded?.sub) return;

    const messageObj = { from: auth.decoded.sub, content: input };
    stompClient.publish({ destination: "/app/send", body: JSON.stringify(messageObj) });
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    stompClient?.deactivate();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-500 text-white flex justify-between items-center py-4 px-4 shadow">
        <span className="text-lg sm:text-xl font-bold">Chat App ({auth.decoded.sub})</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base">
          Logout
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.from === auth.decoded.sub;
          return (
            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] sm:max-w-xs px-3 py-2 sm:px-4 sm:py-2 rounded-lg break-words ${
                  isMe ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-900"
                }`}>
                {isMe ? msg.content : (
                  <>
                    <b>{msg.from}</b>: {msg.content}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-2 sm:p-4 bg-white border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-r-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Send
        </button>
      </div>
    </div>
  );
}