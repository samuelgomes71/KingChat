import React, { useState, useRef, useEffect } from 'react';

const VirtualKeyboard = ({ 
  isVisible, 
  onClose, 
  onTextChange, 
  currentText = '',
  targetInputRef 
}) => {
  const [text, setText] = useState(currentText);
  const [cursorPosition, setCursorPosition] = useState(currentText.length);
  const [capsLock, setCapsLock] = useState(false);
  const [shift, setShift] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);

  useEffect(() => {
    setText(currentText);
    setCursorPosition(currentText.length);
  }, [currentText]);

  // Layout do teclado QWERTY em português
  const qwertyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numbersLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '"', '+', '=', '*', '#']
  ];

  const symbolsLayout = [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['.', ',', '?', '!', "'", '"', '`', '´', '¨', '§']
  ];

  const getCurrentLayout = () => {
    if (showNumbers) return numbersLayout;
    if (showSymbols) return symbolsLayout;
    return qwertyLayout;
  };

  const insertTextAtCursor = (newChar) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    // Aplicar maiúscula/minúscula
    let charToInsert = newChar;
    if (!showNumbers && !showSymbols) {
      charToInsert = (capsLock || shift) ? newChar.toUpperCase() : newChar.toLowerCase();
    }
    
    const newText = beforeCursor + charToInsert + afterCursor;
    setText(newText);
    setCursorPosition(cursorPosition + 1);
    onTextChange(newText);
    
    // Reset shift após uso
    if (shift && !capsLock) {
      setShift(false);
    }
  };

  const handleBackspace = () => {
    if (cursorPosition > 0) {
      const beforeCursor = text.substring(0, cursorPosition - 1);
      const afterCursor = text.substring(cursorPosition);
      const newText = beforeCursor + afterCursor;
      setText(newText);
      setCursorPosition(cursorPosition - 1);
      onTextChange(newText);
    }
  };

  const handleDelete = () => {
    // Esta é a funcionalidade ÚNICA do KingChat!
    // Delete apaga à direita do cursor (não existe em teclados móveis normais)
    if (cursorPosition < text.length) {
      const beforeCursor = text.substring(0, cursorPosition);
      const afterCursor = text.substring(cursorPosition + 1);
      const newText = beforeCursor + afterCursor;
      setText(newText);
      // Cursor permanece na mesma posição
      onTextChange(newText);
    }
  };

  const handleSpace = () => {
    insertTextAtCursor(' ');
  };

  const handleEnter = () => {
    insertTextAtCursor('\n');
  };

  const moveCursor = (direction) => {
    if (direction === 'left' && cursorPosition > 0) {
      setCursorPosition(cursorPosition - 1);
    } else if (direction === 'right' && cursorPosition < text.length) {
      setCursorPosition(cursorPosition + 1);
    }
  };

  const handleCapsLock = () => {
    setCapsLock(!capsLock);
    if (shift) setShift(false);
  };

  const handleShift = () => {
    setShift(!shift);
  };

  if (!isVisible) return null;

  return (
    <div className="virtual-keyboard-overlay">
      <div className="virtual-keyboard">
        <div className="keyboard-header">
          <h4>⌨️ Teclado KingChat</h4>
          <div className="keyboard-features">
            <span className="feature-badge">🗑️ DELETE</span>
            <span className="feature-badge">🔤 QWERTY-BR</span>
          </div>
          <button className="keyboard-close" onClick={onClose}>✕</button>
        </div>

        {/* Preview da texto com cursor */}
        <div className="text-preview">
          <div className="preview-text">
            {text.split('').map((char, index) => (
              <span 
                key={index}
                className={`char ${index === cursorPosition ? 'cursor-before' : ''}`}
              >
                {char === '\n' ? '↵' : char}
              </span>
            ))}
            {cursorPosition === text.length && (
              <span className="cursor">|</span>
            )}
          </div>
        </div>

        {/* Navegação do teclado */}
        <div className="keyboard-nav">
          <button 
            className={`nav-btn ${!showNumbers && !showSymbols ? 'active' : ''}`}
            onClick={() => { setShowNumbers(false); setShowSymbols(false); }}
          >
            ABC
          </button>
          <button 
            className={`nav-btn ${showNumbers ? 'active' : ''}`}
            onClick={() => { setShowNumbers(true); setShowSymbols(false); }}
          >
            123
          </button>
          <button 
            className={`nav-btn ${showSymbols ? 'active' : ''}`}
            onClick={() => { setShowNumbers(false); setShowSymbols(true); }}
          >
            #+=
          </button>
        </div>

        {/* Teclas principais */}
        <div className="keyboard-keys">
          {getCurrentLayout().map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((key) => (
                <button
                  key={key}
                  className="key-btn"
                  onClick={() => insertTextAtCursor(key)}
                >
                  {(capsLock || shift) && !showNumbers && !showSymbols 
                    ? key.toUpperCase() 
                    : key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Teclas especiais */}
        <div className="keyboard-special">
          {/* Primeira linha de teclas especiais */}
          <div className="special-row">
            {!showNumbers && !showSymbols && (
              <button
                className={`special-key caps ${capsLock ? 'active' : ''}`}
                onClick={handleCapsLock}
              >
                ⇪ CAPS
              </button>
            )}
            
            {!showNumbers && !showSymbols && (
              <button
                className={`special-key shift ${shift ? 'active' : ''}`}
                onClick={handleShift}
              >
                ⇧ SHIFT
              </button>
            )}
            
            <button className="special-key space" onClick={handleSpace}>
              _____ ESPAÇO _____
            </button>
          </div>

          {/* Segunda linha - controles de cursor e edição */}
          <div className="special-row">
            <button 
              className="special-key cursor-key" 
              onClick={() => moveCursor('left')}
            >
              ← 
            </button>
            
            <button 
              className="special-key cursor-key" 
              onClick={() => moveCursor('right')}
            >
              →
            </button>
            
            <button 
              className="special-key backspace-key" 
              onClick={handleBackspace}
            >
              ⌫ BACKSPACE
            </button>
            
            {/* TECLA DELETE EXCLUSIVA DO KINGCHAT! */}
            <button 
              className="special-key delete-key kingchat-exclusive" 
              onClick={handleDelete}
              title="Exclusivo KingChat: Apagar à direita do cursor!"
            >
              🗑️ DELETE
            </button>
            
            <button 
              className="special-key enter-key" 
              onClick={handleEnter}
            >
              ↵ ENTER
            </button>
          </div>
        </div>

        {/* Dicas de uso */}
        <div className="keyboard-tips">
          <div className="tip">
            <span className="tip-icon">💡</span>
            <span>Use as setas ← → para posicionar o cursor</span>
          </div>
          <div className="tip exclusive">
            <span className="tip-icon">👑</span>
            <span><strong>Exclusivo KingChat:</strong> Tecla DELETE apaga à direita do cursor!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;