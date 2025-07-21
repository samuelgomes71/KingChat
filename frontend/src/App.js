import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { mockChats, mockFolders, currentUser } from './mock/data';
import { Toaster } from './components/ui/toaster.jsx';

function App() {
  const [chats, setChats] = useState(mockChats);
  const [folders, setFolders] = useState(mockFolders);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [activeFolder, setActiveFolder] = useState('all');
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

  const handleFolderSelect = (folderId) => {
    setActiveFolder(folderId);
    setCurrentChatId(null); // Clear current chat when switching folders
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
    console.log('Nova conversa no KingChat - funcionalidade a ser implementada');
    // Show new chat modal with options:
    // - Novo chat privado
    // - Criar canal
    // - Criar grupo
    // - Chat secreto
    // - Explorar bots
  };

  const handleProfileClick = () => {
    console.log('Menu do chat - funcionalidade a ser implementada');
    // Show chat-specific options
  };

  return (
    <div className="app-container kingchat-app">
      <div className="app-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <Sidebar 
            chats={chats}
            folders={folders}
            activeFolder={activeFolder}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onFolderSelect={handleFolderSelect}
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