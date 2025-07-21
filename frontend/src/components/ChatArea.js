import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const ChatArea = ({ chat, onSendMessage, messages, setMessages }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: "Você",
        time: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: true
      };
      
      setMessages(prev => [...prev, message]);
      onSendMessage(message);
      setNewMessage('');
      
      // Simulate typing and response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "Entendi! 👍",
          "Interessante!",
          "Claro, vamos conversar sobre isso",
          "Obrigado pela mensagem! 😊",
          "Concordo completamente",
          "Que legal! Conte-me mais"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage = {
          id: Date.now() + 1,
          text: randomResponse,
          sender: chat.name,
          time: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: false
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!chat) {
    return (
      <div className="no-chat-selected">
        <div className="no-chat-content">
          <img 
            src="https://images.unsplash.com/photo-1693659128464-c185537840e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxjcm93biUyMGljb258ZW58MHx8fHwxNzUzMDc2NTk4fDA&ixlib=rb-4.1.0&q=85" 
            alt="Crown" 
            className="no-chat-crown"
          />
          <h3>Bem-vindo ao KingChat</h3>
          <p>Selecione uma conversa para começar a trocar mensagens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.isOwn ? 'own-message' : 'other-message'}`}
          >
            {!message.isOwn && !chat.isGroup && (
              <Avatar className="message-avatar">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            {!message.isOwn && chat.isGroup && (
              <Avatar className="message-avatar">
                <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div className="message-content">
              {!message.isOwn && chat.isGroup && (
                <span className="message-sender">{message.sender}</span>
              )}
              <p className="message-text">{message.text}</p>
              <span className="message-time">{message.time}</span>
              {message.isOwn && (
                <div className="message-status">
                  <svg className="read-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6L9 17l-5-5"/>
                    <path d="M16 10l-5 5-2-2"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <Avatar className="message-avatar">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="typing-content">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <button type="button" className="attach-btn" title="Anexar arquivo">
          <svg className="attach-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83L15 5.19"/>
          </svg>
        </button>
        
        <div className="input-wrapper">
          <input
            type="text"
            className="message-input"
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="button" className="emoji-btn" title="Emojis">
            😊
          </button>
        </div>
        
        <Button type="submit" className="send-btn" disabled={!newMessage.trim()}>
          <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22,2 15,22 11,13 2,9 22,2"/>
          </svg>
        </Button>
      </form>
    </div>
  );
};

export default ChatArea;