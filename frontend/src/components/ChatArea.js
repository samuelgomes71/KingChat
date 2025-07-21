import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';
import ForwardModal from './ForwardModal';
import PrivacySettingsModal from './PrivacySettingsModal';
import FileUploadManager from './FileUploadManager';
import VirtualKeyboard from './VirtualKeyboard';
import { messageService } from '../services/messageService';
import { privacyService } from '../services/privacyService';
import { useToast } from '../hooks/use-toast';

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
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [availableContacts, setAvailableContacts] = useState([]);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load contacts for forwarding
  useEffect(() => {
    loadContactsForForward();
  }, []);

  const loadContactsForForward = async () => {
    try {
      const contacts = await messageService.getContactsForForward();
      setAvailableContacts(contacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

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
    messageInputRef.current?.focus();
  };

  const handleEdit = (message) => {
    if (message.sender_id !== currentUser?.id) return;
    
    setEditingMessage(message);
    setNewMessage(message.text || '');
    messageInputRef.current?.focus();
  };

  const handleDelete = async (message) => {
    if (message.sender_id !== currentUser?.id) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      await onDeleteMessage(message.id);
    }
  };

  const handleForward = (message) => {
    setForwardingMessage(message);
    setShowForwardModal(true);
  };

  const handleForwardSubmit = async (forwardData) => {
    if (!forwardingMessage) return;

    try {
      const result = await messageService.forwardMessageUnlimited(
        forwardingMessage.id, 
        forwardData
      );

      if (result.total_sent > 0) {
        toast({
          title: "✅ Mensagem Encaminhada!",
          description: `Enviada com sucesso para ${result.total_sent} contato${result.total_sent !== 1 ? 's' : ''}${result.total_failed > 0 ? ` (${result.total_failed} falharam)` : ''}`,
        });
      }

      if (result.total_failed > 0 && result.total_sent === 0) {
        toast({
          title: "❌ Falha no Encaminhamento",
          description: `Não foi possível enviar para nenhum dos ${result.total_failed} contatos selecionados`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Forward failed:', error);
      toast({
        title: "❌ Erro no Encaminhamento",
        description: "Falha ao encaminhar mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePrivacySettings = () => {
    setShowPrivacyModal(true);
  };

  const handleSavePrivacySettings = async (settings) => {
    try {
      if (chat) {
        // Contact-specific settings
        await privacyService.updateContactPrivacySettings({
          contact_user_id: chat.id,
          ...settings
        });
        toast({
          title: "🔒 Configurações Atualizadas",
          description: `Privacidade configurada para ${chat.name}`,
        });
      } else {
        // Global settings
        await privacyService.updateGlobalPrivacySettings(settings);
        toast({
          title: "🔒 Configurações Globais Atualizadas",
          description: "Suas configurações de privacidade foram salvas",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao salvar configurações de privacidade",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = () => {
    setShowFileUpload(true);
  };

  const handleFilesSelected = async (files) => {
    for (const fileItem of files) {
      try {
        // Aqui você enviaria o arquivo como mensagem
        // Por enquanto, simularemos enviando como texto
        const messageData = {
          text: `📎 Arquivo: ${fileItem.name} (${formatFileSize(fileItem.file.size)})`,
          message_type: 'file',
          media_url: URL.createObjectURL(fileItem.file), // Para preview local
        };
        
        await onSendMessage(messageData);
        
        toast({
          title: "📎 Arquivo Enviado",
          description: `${fileItem.name} foi enviado na ordem correta!`,
        });
      } catch (error) {
        toast({
          title: "❌ Erro no Envio",
          description: `Falha ao enviar ${fileItem.name}`,
          variant: "destructive"
        });
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleVirtualKeyboard = () => {
    setShowVirtualKeyboard(true);
    // Focar no input quando o teclado virtual abrir
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleKeyboardTextChange = (text) => {
    setNewMessage(text);
    // Simular input no campo real para manter sincronização
    if (messageInputRef.current) {
      messageInputRef.current.value = text;
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
            <div className="feature" onClick={() => setShowPrivacyModal(true)}>
              🔒 Configurações de Privacidade
            </div>
            <div className="feature" onClick={handleVirtualKeyboard}>
              ⌨️ Teclado Virtual com DELETE
            </div>
            <div className="feature" onClick={handleFileUpload}>
              📎 Upload Sequencial de Arquivos
            </div>
            <div className="feature">
              📤 Encaminhamento Ilimitado
            </div>
          </div>
        </div>
        
        {/* Modals that can be opened from no-chat state */}
        <PrivacySettingsModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          currentChat={null}
          onSaveSettings={handleSavePrivacySettings}
          currentUser={currentUser}
        />
        
        <VirtualKeyboard
          isVisible={showVirtualKeyboard}
          onClose={() => setShowVirtualKeyboard(false)}
          onTextChange={handleKeyboardTextChange}
          currentText={newMessage}
          targetInputRef={messageInputRef}
        />
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* File Upload Manager */}
      {showFileUpload && (
        <FileUploadManager
          onFilesSelected={handleFilesSelected}
          maxFiles={10}
          acceptedTypes="*"
        />
      )}

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
            <div className="quick-features">
              <button className="feature-btn" onClick={handleFileUpload}>
                📎 Enviar Arquivos
              </button>
              <button className="feature-btn" onClick={handleVirtualKeyboard}>
                ⌨️ Teclado Virtual
              </button>
            </div>
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
                
                {message.forwarded_from && (
                  <div className="forwarded-info">
                    📤 <span>Mensagem encaminhada</span>
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
                  <button 
                    className="action-btn forward-btn" 
                    onClick={() => handleForward(message)}
                    title="Encaminhar (Ilimitado)"
                  >
                    📤
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
          <button 
            type="button" 
            className="attach-btn" 
            title="Upload de Arquivos Sequencial"
            onClick={handleFileUpload}
          >
            <svg className="attach-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83L15 5.19"/>
            </svg>
          </button>
          
          <button 
            type="button" 
            className="privacy-btn" 
            title="Configurações de Privacidade"
            onClick={handlePrivacySettings}
          >
            🔒
          </button>
          
          <button 
            type="button" 
            className="keyboard-btn" 
            title="Teclado Virtual com DELETE"
            onClick={handleVirtualKeyboard}
          >
            ⌨️
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
            ref={messageInputRef}
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

      {/* Forward Modal */}
      <ForwardModal
        isOpen={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          setForwardingMessage(null);
        }}
        onForward={handleForwardSubmit}
        availableContacts={availableContacts}
      />

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        currentChat={chat}
        onSaveSettings={handleSavePrivacySettings}
        currentUser={currentUser}
      />

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={showVirtualKeyboard}
        onClose={() => setShowVirtualKeyboard(false)}
        onTextChange={handleKeyboardTextChange}
        currentText={newMessage}
        targetInputRef={messageInputRef}
      />
    </div>
  );
};

export default ChatArea;