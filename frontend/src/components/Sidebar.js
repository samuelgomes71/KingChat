import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';
import { Badge } from '../ui/badge.jsx';

const Sidebar = ({ chats, currentChatId, onChatSelect, onNewChat, folders, activeFolder, onFolderSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFolder === 'all') return matchesSearch;
    if (activeFolder === 'unread') return matchesSearch && chat.unread > 0;
    if (activeFolder === 'channels') return matchesSearch && chat.type === 'channel';
    if (activeFolder === 'bots') return matchesSearch && chat.type === 'bot';
    if (activeFolder === 'groups') return matchesSearch && chat.type === 'group';
    
    return matchesSearch;
  });

  const getChatTypeIcon = (chat) => {
    switch (chat.type) {
      case 'channel': return '📢';
      case 'bot': return '🤖';
      case 'group': return '👥';
      case 'private': 
        if (chat.hasSecretChat) return '🔒';
        return '';
      default: return '';
    }
  };

  const getChatSubtitle = (chat) => {
    switch (chat.type) {
      case 'channel': return `${chat.subscribers?.toLocaleString()} inscritos`;
      case 'group': return `${chat.members} membros`;
      case 'bot': return 'Bot do KingChat';
      default: 
        if (chat.isOnline) return 'Online';
        if (chat.hasSecretChat) return 'Chat Secreto';
        return 'Última vez há 5 min';
    }
  };

  return (
    <div className="sidebar-container">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>KingChat</h2>
          <div className="header-actions">
            <button className="folder-toggle-btn" title="Organizar">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 0 2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button className="new-chat-btn" onClick={onNewChat} title="Nova conversa">
              <svg className="new-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M12 9v6"/>
                <path d="M9 12h6"/>
              </svg>
            </button>
            <button className="menu-btn" title="Menu">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Folders */}
        <div className="folders-container">
          {folders?.map(folder => (
            <button
              key={folder.id}
              className={`folder-btn ${activeFolder === folder.id ? 'active' : ''}`}
              onClick={() => onFolderSelect?.(folder.id)}
            >
              <span className="folder-icon">{folder.icon}</span>
              <span className="folder-name">{folder.name}</span>
              {folder.count > 0 && (
                <Badge className="folder-count" variant="default">
                  {folder.count}
                </Badge>
              )}
            </button>
          ))}
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
            placeholder="Buscar no KingChat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-filter-btn" title="Filtros avançados">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.map(chat => (
          <div 
            key={chat.id}
            className={`chat-item ${currentChatId === chat.id ? 'active' : ''} ${chat.type}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="chat-avatar-container">
              <Avatar className="chat-avatar">
                <AvatarImage src={chat.avatar} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {chat.isOnline && <div className="online-indicator"></div>}
              <div className="chat-type-badge">{getChatTypeIcon(chat)}</div>
            </div>
            
            <div className="chat-content">
              <div className="chat-header">
                <h4 className="chat-name">{chat.name}</h4>
                <div className="chat-meta">
                  <span className="chat-time">{chat.time}</span>
                  {chat.type === 'channel' && chat.isAdmin && (
                    <span className="admin-badge">👑</span>
                  )}
                </div>
              </div>
              <div className="chat-preview">
                <div className="message-preview">
                  <p className="last-message">{chat.lastMessage}</p>
                  <p className="chat-subtitle">{getChatSubtitle(chat)}</p>
                </div>
                <div className="chat-badges">
                  {chat.unread > 0 && (
                    <Badge className="unread-badge" variant="default">
                      {chat.unread > 99 ? '99+' : chat.unread}
                    </Badge>
                  )}
                  {chat.hasSecretChat && (
                    <div className="secret-badge" title="Chat Secreto">🔒</div>
                  )}
                  {chat.type === 'bot' && (
                    <div className="verified-badge" title="Bot Verificado">✅</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredChats.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Nenhuma conversa encontrada</p>
            <button className="create-chat-btn" onClick={onNewChat}>
              Iniciar nova conversa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;