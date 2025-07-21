import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';

const Header = ({ currentChat, onProfileClick }) => {
  const [showChatInfo, setShowChatInfo] = useState(false);

  const getChatStatus = (chat) => {
    if (!chat) return '';
    
    switch (chat.type) {
      case 'channel':
        return `📢 ${chat.subscribers?.toLocaleString()} inscritos ${chat.isAdmin ? '• Admin' : ''}`;
      case 'group':
        return `👥 ${chat.members} membros`;
      case 'bot':
        return '🤖 Bot Inteligente • Sempre ativo';
      case 'private':
        if (chat.hasSecretChat) return '🔒 Chat Secreto';
        return chat.isOnline ? '🟢 Online' : '⚪ Última vez há 5 min';
      default:
        return chat?.isOnline ? '🟢 Online' : '⚪ Última vez há 5 min';
    }
  };

  const getChatActions = (chat) => {
    if (!chat) return [];
    
    const baseActions = [
      { icon: "🔍", title: "Buscar na conversa", action: "search" },
      { icon: "⭐", title: "Mensagens importantes", action: "starred" },
    ];
    
    switch (chat.type) {
      case 'channel':
        return [
          ...baseActions,
          { icon: "📊", title: "Estatísticas do canal", action: "stats" },
          { icon: "👥", title: "Inscritos", action: "subscribers" },
          ...(chat.isAdmin ? [
            { icon: "⚙️", title: "Configurações do canal", action: "settings" }
          ] : [])
        ];
      case 'group':
        return [
          ...baseActions,
          { icon: "👥", title: "Membros do grupo", action: "members" },
          { icon: "📎", title: "Arquivos compartilhados", action: "media" },
          { icon: "⚙️", title: "Configurações do grupo", action: "settings" }
        ];
      case 'bot':
        return [
          ...baseActions,
          { icon: "🤖", title: "Comandos do bot", action: "commands" },
          { icon: "❓", title: "Ajuda do bot", action: "help" }
        ];
      default:
        return [
          ...baseActions,
          { icon: "📞", title: "Chamada de voz", action: "voice_call" },
          { icon: "📹", title: "Chamada de vídeo", action: "video_call" },
          { icon: "📎", title: "Arquivos compartilhados", action: "media" },
          ...(chat.hasSecretChat ? [
            { icon: "🔒", title: "Configurações do chat secreto", action: "secret_settings" }
          ] : [])
        ];
    }
  };

  const handleActionClick = (action) => {
    console.log(`Ação executada: ${action}`);
    // Implement action functionality
  };

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
        <div className="app-subtitle">Conversas Reais</div>
      </div>

      {/* Current Chat Info */}
      {currentChat ? (
        <div className="chat-header">
          <div className="chat-info" onClick={() => setShowChatInfo(!showChatInfo)}>
            <Avatar className="chat-avatar">
              <AvatarImage src={currentChat.avatar} />
              <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="chat-details">
              <div className="chat-name-row">
                <h3 className="chat-name">{currentChat.name}</h3>
                {currentChat.type === 'bot' && <span className="verified-badge">✅</span>}
                {currentChat.type === 'channel' && currentChat.isAdmin && <span className="admin-crown">👑</span>}
                {currentChat.hasSecretChat && <span className="secret-indicator">🔒</span>}
              </div>
              <p className="chat-status">{getChatStatus(currentChat)}</p>
            </div>
          </div>
          
          <div className="chat-actions">
            {getChatActions(currentChat).map((action, index) => (
              <button 
                key={index}
                className="action-btn" 
                title={action.title}
                onClick={() => handleActionClick(action.action)}
              >
                <span className="action-emoji">{action.icon}</span>
              </button>
            ))}
            
            <button className="action-btn menu-btn" title="Menu do chat" onClick={onProfileClick}>
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
          <div className="welcome-text">
            <h3>👑 Selecione uma conversa</h3>
            <p>Explore canais, converse com bots ou inicie um chat privado</p>
          </div>
          
          <div className="quick-actions">
            <button className="quick-action-btn" title="Criar canal">
              <span>📢</span>
              <span>Canal</span>
            </button>
            <button className="quick-action-btn" title="Novo grupo">
              <span>👥</span>
              <span>Grupo</span>
            </button>
            <button className="quick-action-btn" title="Chat secreto">
              <span>🔒</span>
              <span>Secreto</span>
            </button>
            <button className="quick-action-btn" title="Explorar bots">
              <span>🤖</span>
              <span>Bots</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Chat Info Modal */}
      {showChatInfo && currentChat && (
        <div className="chat-info-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowChatInfo(false)}>✕</button>
            <h3>{currentChat.name}</h3>
            <p>Informações detalhadas do chat apareceriam aqui</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;