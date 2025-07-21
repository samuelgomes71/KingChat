import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';

const ForwardModal = ({ isOpen, onClose, onForward, availableContacts }) => {
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [caption, setCaption] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedContacts(new Set());
      setSearchTerm('');
      setCaption('');
    }
  }, [isOpen]);

  const filteredContacts = availableContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleContact = (contactId) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleForward = async () => {
    if (selectedContacts.size === 0) return;

    setIsForwarding(true);
    try {
      await onForward({
        target_chat_ids: Array.from(selectedContacts),
        add_caption: caption.trim() || null
      });
      onClose();
    } catch (error) {
      console.error('Forward failed:', error);
    } finally {
      setIsForwarding(false);
    }
  };

  const getContactTypeIcon = (type) => {
    switch (type) {
      case 'channel': return '📢';
      case 'group': return '👥';
      case 'bot': return '🤖';
      case 'private': return '💬';
      default: return '💬';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="forward-modal-overlay">
      <div className="forward-modal">
        <div className="forward-modal-header">
          <h3>📤 Encaminhar Mensagem</h3>
          <p className="forward-subtitle">
            📈 <strong>Envio Ilimitado!</strong> Diferente do WhatsApp (máx. 5), 
            no KingChat você pode enviar para quantos contatos quiser
          </p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="forward-modal-body">
          {/* Search */}
          <div className="forward-search">
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="forward-search-input"
            />
          </div>

          {/* Caption */}
          <div className="forward-caption">
            <textarea
              placeholder="Adicionar uma legenda (opcional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="forward-caption-input"
              rows="2"
            />
          </div>

          {/* Selected Counter */}
          {selectedContacts.size > 0 && (
            <div className="selected-counter">
              <span className="counter-badge">
                {selectedContacts.size} contato{selectedContacts.size !== 1 ? 's' : ''} selecionado{selectedContacts.size !== 1 ? 's' : ''}
              </span>
              <button
                className="clear-selection"
                onClick={() => setSelectedContacts(new Set())}
              >
                Limpar Seleção
              </button>
            </div>
          )}

          {/* Contacts List */}
          <div className="forward-contacts-list">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`forward-contact-item ${selectedContacts.has(contact.id) ? 'selected' : ''}`}
                onClick={() => toggleContact(contact.id)}
              >
                <div className="contact-checkbox">
                  <div className={`checkbox ${selectedContacts.has(contact.id) ? 'checked' : ''}`}>
                    {selectedContacts.has(contact.id) && '✓'}
                  </div>
                </div>
                
                <Avatar className="contact-avatar">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="contact-info">
                  <div className="contact-name">
                    <span className="contact-type-icon">{getContactTypeIcon(contact.type)}</span>
                    {contact.name}
                  </div>
                  <div className="contact-type">
                    {contact.type === 'private' && 'Conversa Privada'}
                    {contact.type === 'group' && 'Grupo'}
                    {contact.type === 'channel' && 'Canal'}
                    {contact.type === 'bot' && 'Bot'}
                  </div>
                </div>

                {contact.is_online && (
                  <div className="online-indicator"></div>
                )}
              </div>
            ))}

            {filteredContacts.length === 0 && (
              <div className="no-contacts">
                <div className="no-contacts-icon">🔍</div>
                <p>Nenhum contato encontrado</p>
              </div>
            )}
          </div>
        </div>

        <div className="forward-modal-footer">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleForward}
            disabled={selectedContacts.size === 0 || isForwarding}
          >
            {isForwarding ? (
              <>
                <div className="loading-spinner"></div>
                Enviando...
              </>
            ) : (
              <>
                📤 Encaminhar para {selectedContacts.size} contato{selectedContacts.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;