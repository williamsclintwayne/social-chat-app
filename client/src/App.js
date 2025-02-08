import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage setUser={setUser} />} />
        <Route 
          path="/chat" 
          element={user ? <ChatPage user={user} socket={socket} /> : <AuthPage setUser={setUser} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
