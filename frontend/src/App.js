import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginScreen from './components/LoginScreen';
import { Toaster } from './components/ui/toaster.jsx';
import { authService } from './services/authService';
import { chatService } from './services/chatService';
import { messageService } from './services/messageService';
import { useToast } from './hooks/use-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Chat state
  const [chats, setChats] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [activeFolder, setActiveFolder] = useState('all');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const { toast } = useToast();

  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
          setIsAuthenticated(true);
          await loadUserData();
        }
      }
    } catch (error) {
      console.error('App initialization failed:', error);
      // If there's an error, clear stored data
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await chatService.getUserChatsWithFolders();
      setChats(userData.chats || []);
      setFolders(userData.folders || []);
      setCurrentUser(userData.user);
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do usuário",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const { user } = await authService.demoLogin();
      setCurrentUser(user);
      setIsAuthenticated(true);
      await loadUserData();
      
      toast({
        title: "Bem-vindo ao KingChat! 👑",
        description: `Olá, ${user.name}! Você está logado com sucesso.`
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Erro no Login",
        description: "Falha ao fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setChats([]);
    setFolders([]);
    setCurrentChatId(null);
    setMessages([]);
    
    toast({
      title: "Logout Realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    
    try {
      setIsLoadingMessages(true);
      const chatMessages = await messageService.getChatMessages(chatId);
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId, loadMessages]);

  const handleChatSelect = async (chatId) => {
    setCurrentChatId(chatId);
    
    // Mark messages as read (simplified - in a real app you'd track unread messages)
    try {
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1 && chats[chatIndex].unread_count > 0) {
        const updatedChats = [...chats];
        updatedChats[chatIndex] = { ...updatedChats[chatIndex], unread_count: 0 };
        setChats(updatedChats);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleFolderSelect = (folderId) => {
    setActiveFolder(folderId);
    setCurrentChatId(null);
  };

  const handleSendMessage = async (messageData) => {
    if (!currentChatId) return;

    try {
      const response = await messageService.sendMessage(currentChatId, messageData);
      const newMessage = response.message;
      
      // Add message to local state
      setMessages(prev => [...prev, newMessage]);
      
      // Update chat's last message
      const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
      if (chatIndex !== -1) {
        const updatedChats = [...chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          last_message: newMessage.text || "Mídia",
          last_message_time: newMessage.timestamp
        };
        // Move chat to top
        const [updatedChat] = updatedChats.splice(chatIndex, 1);
        setChats([updatedChat, ...updatedChats]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive"
      });
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    try {
      const updatedMessage = await messageService.updateMessage(messageId, { text: newText });
      
      // Update local message state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
      
      toast({
        title: "Mensagem editada",
        description: "Sua mensagem foi editada com sucesso."
      });
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast({
        title: "Erro",
        description: "Falha ao editar mensagem",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir mensagem",
        variant: "destructive"
      });
    }
  };

  const handleNewChat = () => {
    toast({
      title: "Em breve!",
      description: "Funcionalidade de criar novo chat será implementada em breve."
    });
  };

  const handleProfileClick = () => {
    toast({
      title: "Perfil",
      description: "Configurações do perfil em desenvolvimento."
    });
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="app-container kingchat-app">
        <div className="loading-screen">
          <img 
            src="https://images.unsplash.com/photo-1693659128464-c185537840e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxjcm93biUyMGljb258ZW58MHx8fHwxNzUzMDc2NTk4fDA&ixlib=rb-4.1.0&q=85" 
            alt="Crown" 
            className="loading-crown"
          />
          <h2>👑 KingChat</h2>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <LoginScreen onLogin={handleLogin} isLoading={isLoading} />
        <Toaster />
      </div>
    );
  }

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
            currentUser={currentUser}
            onProfileClick={handleProfileClick}
            onLogout={handleLogout}
          />
          <ChatArea 
            chat={currentChat}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            currentUser={currentUser}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;