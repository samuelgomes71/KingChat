import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';

const ChatArea = ({ chat, onSendMessage, messages, setMessages }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (editingMessage) {
      // Edit message
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage.id 
          ? { ...msg, text: newMessage, isEdited: true }
          : msg
      ));
      setEditingMessage(null);
    } else {
      // Send new message
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: "Você",
        time: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: true,
        canEdit: true,
        replyTo: replyToMessage?.id || null
      };
      
      setMessages(prev => [...prev, message]);
      onSendMessage(message);
    }
    
    setNewMessage('');
    setReplyToMessage(null);
    
    // Simulate bot/user response
    if (chat?.type !== 'channel') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let response = "";
        
        if (chat?.type === 'bot') {
          const botResponses = [
            "🤖 Processando sua solicitação...",
            "✅ Comando executado com sucesso!",
            "📊 Aqui estão os dados que você pediu:",
            "🎯 Perfeito! Mais alguma coisa?",
            "🔍 Encontrei algumas informações interessantes:",
            "⚡ Funcionalidade ativada no KingChat!"
          ];
          response = botResponses[Math.floor(Math.random() * botResponses.length)];
        } else {
          const responses = [
            "Entendi! 👍",
            "Interessante!",
            "Claro, vamos conversar sobre isso",
            "Obrigado pela mensagem! 😊",
            "Concordo completamente",
            "Que legal! Conte-me mais",
            "Excelente ponto de vista!",
            "Vamos marcar para conversarmos melhor"
          ];
          response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        const responseMessage = {
          id: Date.now() + 1,
          text: response,
          sender: chat.name,
          time: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          isOwn: false,
          canEdit: false,
          isBot: chat?.type === 'bot'
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

  const handleReply = (message) => {
    setReplyToMessage(message);
    document.querySelector('.message-input').focus();
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);
    document.querySelector('.message-input').focus();
  };

  const handleForward = (message) => {
    console.log('Forward message:', message);
    // Implement forward functionality
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
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
          <h3>👑 Bem-vindo ao KingChat</h3>
          <p>A nova era das conversas inteligentes chegou!</p>
          <div className="features-preview">
            <div className="feature">🤖 Bots Inteligentes</div>
            <div className="feature">📢 Canais Premium</div>
            <div className="feature">🔒 Chats Secretos</div>
            <div className="feature">⏰ Mensagens Programadas</div>
          </div>
        </div>
      </div>
    );
  }

  const getReplyMessage = (replyId) => {
    return messages.find(msg => msg.id === replyId);
  };

  return (
    <div className="chat-area">
      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => {
          const replyMsg = message.replyTo ? getReplyMessage(message.replyTo) : null;
          
          return (
            <div 
              key={message.id} 
              className={`message ${message.isOwn ? 'own-message' : 'other-message'} ${message.isBot ? 'bot-message' : ''} ${message.isChannelPost ? 'channel-message' : ''}`}
            >
              {!message.isOwn && (
                <Avatar className="message-avatar">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              
              <div className="message-content">
                {!message.isOwn && (chat.type === 'group' || chat.type === 'channel') && (
                  <span className="message-sender">{message.sender}</span>
                )}
                
                {replyMsg && (
                  <div className="reply-preview">
                    <div className="reply-line"></div>
                    <div className="reply-content">
                      <span className="reply-sender">{replyMsg.sender}</span>
                      <p className="reply-text">{replyMsg.text}</p>
                    </div>
                  </div>
                )}
                
                <p className="message-text">{message.text}</p>
                
                {message.isEdited && (
                  <span className="edited-badge">editada</span>
                )}
                
                {message.isSecret && (
                  <div className="secret-message-info">
                    <span className="secret-badge">🔒 Mensagem Secreta</span>
                    {message.selfDestruct && (
                      <span className="destruct-timer">🕐 {message.selfDestruct}</span>
                    )}
                  </div>
                )}
                
                <div className="message-footer">
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
                
                {/* Message Actions */}
                <div className="message-actions">
                  <button 
                    className="action-btn reply-btn" 
                    onClick={() => handleReply(message)}
                    title="Responder"
                  >
                    ↩️
                  </button>
                  <button 
                    className="action-btn forward-btn" 
                    onClick={() => handleForward(message)}
                    title="Encaminhar"
                  >
                    ➡️
                  </button>
                  {message.canEdit && (
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEdit(message)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                
                {/* Bot Quick Replies */}
                {message.quickReplies && (
                  <div className="quick-replies">
                    {message.quickReplies.map((reply, index) => (
                      <button 
                        key={index}
                        className="quick-reply-btn"
                        onClick={() => setNewMessage(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
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

      {/* Reply/Edit Bar */}
      {(replyToMessage || editingMessage) && (
        <div className="reply-edit-bar">
          <div className="reply-edit-content">
            {replyToMessage && (
              <>
                <span className="action-label">↩️ Respondendo para {replyToMessage.sender}</span>
                <p className="reply-text">{replyToMessage.text}</p>
              </>
            )}
            {editingMessage && (
              <>
                <span className="action-label">✏️ Editando mensagem</span>
              </>
            )}
          </div>
          <button 
            className="cancel-btn" 
            onClick={replyToMessage ? cancelReply : cancelEdit}
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <div className="input-actions">
          <button type="button" className="attach-btn" title="Anexar arquivo">
            <svg className="attach-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83L15 5.19"/>
            </svg>
          </button>
          
          {chat?.type !== 'channel' && (
            <button type="button" className="schedule-btn" title="Agendar mensagem" onClick={() => setShowScheduleModal(true)}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </button>
          )}
          
          <button type="button" className="poll-btn" title="Criar enquete">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3v18h18"/>
              <path d="M7 16V9"/>
              <path d="M12 16V6"/>
              <path d="M17 16v-4"/>
            </svg>
          </button>
        </div>
        
        <div className="input-wrapper">
          <input
            type="text"
            className="message-input"
            placeholder={
              editingMessage ? "Editar mensagem..." :
              chat?.type === 'bot' ? "Digite um comando ou mensagem..." :
              chat?.type === 'channel' ? "Escrever no canal..." :
              "Digite uma mensagem no KingChat..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="button" className="emoji-btn" title="Emojis & Stickers">
            😊
          </button>
          <button type="button" className="sticker-btn" title="Stickers do KingChat">
            👑
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