import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const Header = ({ currentChat, onProfileClick }) => {
  return (
    <div className="header-container">
      {/* App Logo/Title */}
      <div className="app-logo">
        <img 
          src="https://images.unsplash.com/photo-1693659128464-c185537840e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxjcm93biUyMGljb258ZW58MHx8fHwxNzUzMDc2NTk4fDA&ixlib=rb-4.1.0&q=85" 
          alt="Crown" 
          className="crown-icon"
        />
        <h1 className="app-title">KingChat</h1>
      </div>

      {/* Current Chat Info */}
      {currentChat ? (
        <div className="chat-header">
          <div className="chat-info">
            <Avatar className="chat-avatar">
              <AvatarImage src={currentChat.avatar} />
              <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="chat-details">
              <h3 className="chat-name">{currentChat.name}</h3>
              <p className="chat-status">
                {currentChat.isGroup ? 
                  `${Math.floor(Math.random() * 50) + 2} membros` : 
                  currentChat.isOnline ? 'Online' : 'Última vez há 5 min'
                }
              </p>
            </div>
          </div>
          <div className="chat-actions">
            <button className="action-btn" title="Chamada de voz">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
            <button className="action-btn" title="Chamada de vídeo">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </button>
            <button className="action-btn" title="Mais opções" onClick={onProfileClick}>
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="no-chat-header">
          <p className="no-chat-text">Selecione uma conversa para começar</p>
        </div>
      )}
    </div>
  );
};

export default Header;