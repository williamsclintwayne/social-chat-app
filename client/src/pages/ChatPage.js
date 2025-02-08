import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css"; // Make sure to create this CSS file

export default function ChatPage({ user, socket }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Token verification and initial message load
  useEffect(() => {
    console.log('Current User ID:', user?.id); // Add this
    const verifyAndLoad = async () => {
      try {
        // Verify token validity
        await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);

        // Load message history
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/messages`
        );
        setMessages(response.data);
      } catch (err) {
        localStorage.removeItem("authToken");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    console.log('User prop:', user);
    if (!user) navigate("/");
    verifyAndLoad();
  }, [navigate, user]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message) => {
      setMessages((prev) => [message, ...prev]); // New messages at top
    };

    socket.on("receiveMessage", messageHandler);

    return () => {
      socket.off("receiveMessage", messageHandler);
    };
  }, [socket]);

  // Update message sending in ChatPage.js
  const handleSend = async () => {
    if (!newMessage.trim()) return;
  
    try {
        if (!user?.id) {
            throw new Error('UUser ID is missing in user object');
          }

          console.log('Sending message with user ID:', user.id);
      
          const userId = user.id.toString().trim();
          if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
            console.error('Invalid ID format:', userId);
            throw new Error('Invalid user ID format');
          }
          

          const messageData = {
            text: newMessage.trim(),
            userId: userId
          };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      socket.emit("sendMessage", response.data);
      setNewMessage("");
    } catch (err) {
      console.error("Message error:", {
        error: err.message,
        response: err.response?.data,
      });
      setError(err.response?.data?.error || "Failed to send message");
    }
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Welcome, {user?.username}</h2>
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.userId === user.id ? "own-message" : ""}`}
          >
            <div className="message-header">
              <strong>{msg.sender}</strong>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={!newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
