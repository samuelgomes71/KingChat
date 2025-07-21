import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { mockChats, currentUser } from './mock/data';
import { Toaster } from './components/ui/toaster';

function App() {
  const [chats, setChats] = useState(mockChats);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
    }
  }, [currentChat]);

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    // Mark as read
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unread: 0 } : chat
    ));
  };

  const handleSendMessage = (message) => {
    if (currentChatId) {
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              lastMessage: message.text,
              time: message.time,
              messages: [...(chat.messages || []), message]
            }
          : chat
      ));
    }
  };

  const handleNewChat = () => {
    console.log('Nova conversa - funcionalidade a ser implementada');
  };

  const handleProfileClick = () => {
    console.log('Perfil clicado - funcionalidade a ser implementada');
  };

  return (
    <div className="app-container">
      <div className="app-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <Sidebar 
            chats={chats}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Header 
            currentChat={currentChat}
            onProfileClick={handleProfileClick}
          />
          <ChatArea 
            chat={currentChat}
            onSendMessage={handleSendMessage}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;