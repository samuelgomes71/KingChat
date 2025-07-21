import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button.jsx';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar.jsx';

const PrivacySettingsModal = ({ isOpen, onClose, currentChat, onSaveSettings, currentUser }) => {
  const [settings, setSettings] = useState({
    // Global defaults
    default_show_read_receipts: true,
    default_show_last_seen: true,
    default_show_online_status: true,
    
    // Contact specific (if currentChat is provided)
    show_read_receipts_to_contact: true,
    can_see_contact_read_receipts: true,
    show_last_seen_to_contact: true,
    can_see_contact_last_seen: true,
    show_online_status_to_contact: true,
    can_see_contact_online_status: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(currentChat ? 'contact' : 'global');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, currentChat]);

  const loadSettings = async () => {
    // Load settings from API - for now using defaults
    // In real implementation, you would fetch from backend
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSaveSettings(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="privacy-modal-overlay">
      <div className="privacy-modal">
        <div className="privacy-modal-header">
          <h3>🔒 Configurações de Privacidade</h3>
          <p className="privacy-subtitle">
            ⭐ <strong>Controle Individual!</strong> Configure a privacidade por contato - 
            funcionalidade exclusiva do KingChat
          </p>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="privacy-tabs">
          <button
            className={`privacy-tab ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            🌐 Configurações Globais
          </button>
          {currentChat && (
            <button
              className={`privacy-tab ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              👤 Para este Contato
            </button>
          )}
        </div>

        <div className="privacy-modal-body">
          {activeTab === 'global' && (
            <div className="privacy-section">
              <h4>Configurações Padrão</h4>
              <p className="section-description">
                Estas configurações se aplicam a todos os seus contatos, 
                exceto aqueles com configurações individuais.
              </p>

              <div className="privacy-setting">
                <div className="setting-info">
                  <div className="setting-title">
                    <span className="setting-icon">✓</span>
                    Confirmação de Leitura
                  </div>
                  <div className="setting-description">
                    Permitir que outros vejam quando você leu as mensagens deles
                  </div>
                </div>
                <label className="privacy-toggle">
                  <input
                    type="checkbox"
                    checked={settings.default_show_read_receipts}
                    onChange={() => handleToggle('default_show_read_receipts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="privacy-setting">
                <div className="setting-info">
                  <div className="setting-title">
                    <span className="setting-icon">👁️</span>
                    Última Visualização
                  </div>
                  <div className="setting-description">
                    Permitir que outros vejam quando você esteve online pela última vez
                  </div>
                </div>
                <label className="privacy-toggle">
                  <input
                    type="checkbox"
                    checked={settings.default_show_last_seen}
                    onChange={() => handleToggle('default_show_last_seen')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="privacy-setting">
                <div className="setting-info">
                  <div className="setting-title">
                    <span className="setting-icon">🟢</span>
                    Status Online
                  </div>
                  <div className="setting-description">
                    Mostrar quando você está online no momento
                  </div>
                </div>
                <label className="privacy-toggle">
                  <input
                    type="checkbox"
                    checked={settings.default_show_online_status}
                    onChange={() => handleToggle('default_show_online_status')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'contact' && currentChat && (
            <div className="privacy-section">
              <div className="contact-header">
                <Avatar className="contact-avatar">
                  <AvatarImage src={currentChat.avatar} />
                  <AvatarFallback>{currentChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4>{currentChat.name}</h4>
                  <p>Configurações específicas para este contato</p>
                </div>
              </div>

              <div className="privacy-subsection">
                <h5>🔐 O que {currentChat.name} pode ver sobre você</h5>
                
                <div className="privacy-setting">
                  <div className="setting-info">
                    <div className="setting-title">Confirmação de Leitura</div>
                    <div className="setting-description">
                      {currentChat.name} pode ver quando você leu as mensagens
                    </div>
                  </div>
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={settings.show_read_receipts_to_contact}
                      onChange={() => handleToggle('show_read_receipts_to_contact')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="privacy-setting">
                  <div className="setting-info">
                    <div className="setting-title">Última Visualização</div>
                    <div className="setting-description">
                      {currentChat.name} pode ver quando você esteve online
                    </div>
                  </div>
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={settings.show_last_seen_to_contact}
                      onChange={() => handleToggle('show_last_seen_to_contact')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="privacy-setting">
                  <div className="setting-info">
                    <div className="setting-title">Status Online</div>
                    <div className="setting-description">
                      {currentChat.name} pode ver quando você está online
                    </div>
                  </div>
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={settings.show_online_status_to_contact}
                      onChange={() => handleToggle('show_online_status_to_contact')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="privacy-subsection">
                <h5>👁️ O que você pode ver sobre {currentChat.name}</h5>
                
                <div className="privacy-setting">
                  <div className="setting-info">
                    <div className="setting-title">Confirmação de Leitura</div>
                    <div className="setting-description">
                      Ver quando {currentChat.name} leu suas mensagens
                    </div>
                  </div>
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={settings.can_see_contact_read_receipts}
                      onChange={() => handleToggle('can_see_contact_read_receipts')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="privacy-setting">
                  <div className="setting-info">
                    <div className="setting-title">Última Visualização</div>
                    <div className="setting-description">
                      Ver quando {currentChat.name} esteve online
                    </div>
                  </div>
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={settings.can_see_contact_last_seen}
                      onChange={() => handleToggle('can_see_contact_last_seen')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="privacy-setting">
                  <div className="setting-info">
                    <div className="setting-title">Status Online</div>
                    <div className="setting-description">
                      Ver quando {currentChat.name} está online
                    </div>
                  </div>
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={settings.can_see_contact_online_status}
                      onChange={() => handleToggle('can_see_contact_online_status')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="privacy-note">
                <div className="note-icon">💡</div>
                <div className="note-text">
                  <strong>Dica KingChat:</strong> Configurações individuais substituem as configurações globais. 
                  Você tem controle total sobre sua privacidade com cada contato!
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="privacy-modal-footer">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Salvando...
              </>
            ) : (
              '💾 Salvar Configurações'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsModal;