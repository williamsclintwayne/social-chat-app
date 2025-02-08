import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChatPage({ user, socket }) {
    const [message, setMessage] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }

        socket.on('receiveMessage', (message) => {
            setMessage(prev => [...prev, message]);
        });

        return () => {
            socket.off('receiveMessage');
        }, [socket, navigate, user]});

        const handleSend = async () => {
            if (newMassage.trim()) {
                const messageData = {
                    text: newMessage,
                    sender: user.username,
                    timestamp: new Date().toISOString()
            };

            socket.emit('sendMessage', messageData);
            setNewMessage('');
        }
    };

    return (
       <div className="chat-container">
            <div className="messages">
                {messages.map((msp, i) => (
                    <div key={i} className={`message ${msg.sender === user.username ? 'sent' : 'received'}`}>
                    <strong>{msg.sender}</strong>
                    </div>
                ))}
            </div>
            <div className="message-input">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
            </div>
       </div>       
    );
}