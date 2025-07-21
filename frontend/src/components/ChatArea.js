import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';

const ChatArea = ({ 
  chat, 
  messages, 
  isLoadingMessages, 
  onSendMessage, 
  onEditMessage, 
  onDeleteMessage, 
  currentUser 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      message_type: 'text',
      reply_to: replyToMessage?.id || null,
    };

    if (editingMessage) {
      // Edit existing message
      await onEditMessage(editingMessage.id, newMessage);
      setEditingMessage(null);
    } else {
      // Send new message
      await onSendMessage(messageData);
    }

    setNewMessage('');
    setReplyToMessage(null);
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
    if (message.sender_id !== currentUser?.id) return;
    
    setEditingMessage(message);
    setNewMessage(message.text || '');
    document.querySelector('.message-input').focus();
  };

  const handleDelete = async (message) => {
    if (message.sender_id !== currentUser?.id) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      await onDeleteMessage(message.id);
    }
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const getReplyMessage = (replyId) => {
    return messages.find(msg => msg.id === replyId);
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const isOwnMessage = (message) => {
    return message.sender_id === currentUser?.id;
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

  return (
    <div className="chat-area">
      {/* Messages Container */}
      <div className="messages-container">
        {isLoadingMessages && (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>Carregando mensagens...</p>
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="empty-messages">
            <div className="empty-icon">💬</div>
            <p>Nenhuma mensagem ainda</p>
            <p>Seja o primeiro a enviar uma mensagem!</p>
          </div>
        )}

        {messages.map((message) => {
          const replyMsg = message.reply_to ? getReplyMessage(message.reply_to) : null;
          const isOwn = isOwnMessage(message);
          
          return (
            <div 
              key={message.id} 
              className={`message ${isOwn ? 'own-message' : 'other-message'} ${message.is_bot ? 'bot-message' : ''}`}
            >
              {!isOwn && (
                <Avatar className="message-avatar">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{message.sender_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              )}
              
              <div className="message-content">
                {!isOwn && (chat.type === 'group' || chat.type === 'channel') && (
                  <span className="message-sender">{message.sender_name}</span>
                )}
                
                {replyMsg && (
                  <div className="reply-preview">
                    <div className="reply-line"></div>
                    <div className="reply-content">
                      <span className="reply-sender">{replyMsg.sender_name}</span>
                      <p className="reply-text">{replyMsg.text}</p>
                    </div>
                  </div>
                )}
                
                <p className="message-text">{message.text}</p>
                
                {message.is_edited && (
                  <span className="edited-badge">editada</span>
                )}
                
                {message.is_secret && (
                  <div className="secret-message-info">
                    <span className="secret-badge">🔒 Mensagem Secreta</span>
                  </div>
                )}
                
                <div className="message-footer">
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                  
                  {isOwn && (
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
                  {isOwn && (
                    <>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEdit(message)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(message)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
                
                {/* Bot Quick Replies */}
                {message.quick_replies && message.quick_replies.length > 0 && (
                  <div className="quick-replies">
                    {message.quick_replies.map((reply, index) => (
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
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply/Edit Bar */}
      {(replyToMessage || editingMessage) && (
        <div className="reply-edit-bar">
          <div className="reply-edit-content">
            {replyToMessage && (
              <>
                <span className="action-label">↩️ Respondendo para {replyToMessage.sender_name}</span>
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
            <button type="button" className="schedule-btn" title="Agendar mensagem">
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