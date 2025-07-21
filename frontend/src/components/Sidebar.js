import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

const Sidebar = ({ chats, currentChatId, onChatSelect, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar-container">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>Conversas</h2>
          <button className="new-chat-btn" onClick={onNewChat} title="Nova conversa">
            <svg className="new-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M12 9v6"/>
              <path d="M9 12h6"/>
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="search-container">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.map(chat => (
          <div 
            key={chat.id}
            className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="chat-avatar-container">
              <Avatar className="chat-avatar">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {chat.isOnline && <div className="online-indicator"></div>}
              {chat.isGroup && <div className="group-indicator">👥</div>}
            </div>
            
            <div className="chat-content">
              <div className="chat-header">
                <h4 className="chat-name">{chat.name}</h4>
                <span className="chat-time">{chat.time}</span>
              </div>
              <div className="chat-preview">
                <p className="last-message">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <Badge className="unread-badge" variant="default">
                    {chat.unread}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;