import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

let stompClient = null;

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwt"); // your JWT token

    // Assign STOMP client to outer variable
    stompClient = new Client({
      brokerURL: "ws://localhost:8082/chat", // native WebSocket
      connectHeaders: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzbWl0OTk5QGdtYWlsLmNvbSIsImlhdCI6MTc3MzYxOTI5OCwiZXhwIjoxNzczNjIyODk4fQ.X-dB6tFNz0I75hGgS8oIbPFxtXlNC75CWmITy93kwFI`,
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected via native WebSocket");

        // Subscribe to topic
        stompClient.subscribe("/topic/messages", (msg) => {
          const body = JSON.parse(msg.body);
          setMessages((prev) => [...prev, body]);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers.message);
      },
    });

    stompClient.activate();

    // Cleanup on unmount
    return () => stompClient?.deactivate();
  }, []);

  function send() {
    if (stompClient && stompClient.connected && message.trim() !== "") {
      stompClient.publish({
        destination: "/app/send",
        body: JSON.stringify({ from: "smit", content: message }),
      });
      setMessage("");
    }
  }

  return (
    <div className="App">
      <h2>Chat</h2>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.from}</b>: {m.content}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default App;