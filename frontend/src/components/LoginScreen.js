import React, { useState } from 'react';
import { Button } from '../ui/button.jsx';

const LoginScreen = ({ onLogin, isLoading }) => {
  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <img 
            src="https://images.unsplash.com/photo-1693659128464-c185537840e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxjcm93biUyMGljb258ZW58MHx8fHwxNzUzMDc2NTk4fDA&ixlib=rb-4.1.0&q=85" 
            alt="Crown" 
            className="login-crown"
          />
          <h1 className="login-title">👑 KingChat</h1>
          <p className="login-subtitle">A Nova Era das Conversas Inteligentes</p>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span className="feature-text">Bots Inteligentes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📢</span>
            <span className="feature-text">Canais Premium</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">Chats Secretos</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <span className="feature-text">Mensagens Programadas</span>
          </div>
        </div>

        <div className="login-actions">
          <Button 
            onClick={onLogin}
            disabled={isLoading}
            className="login-button"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Conectando...
              </>
            ) : (
              <>
                🚀 Entrar no KingChat
              </>
            )}
          </Button>
          <p className="login-note">
            Clique para entrar com a conta demo e explorar todas as funcionalidades
          </p>
        </div>

        <div className="login-footer">
          <p>Desenvolvido com 👑 pela equipe KingChat</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;