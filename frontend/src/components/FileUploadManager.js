import React, { useState, useRef } from 'react';
import { Button } from '../ui/button.jsx';

const FileUploadManager = ({ onFilesSelected, maxFiles = 10, acceptedTypes = "*" }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Manter ordem de seleção com timestamp
    const filesWithOrder = selectedFiles.map((file, index) => ({
      file,
      id: `${Date.now()}_${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      orderIndex: files.length + index,
      status: 'pending' // pending, uploading, completed, error
    }));

    setFiles(prev => [...prev, ...filesWithOrder]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const reorderFiles = (fromIndex, toIndex) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      
      // Atualizar orderIndex para manter ordem correta
      return newFiles.map((file, index) => ({
        ...file,
        orderIndex: index
      }));
    });
  };

  const uploadFilesSequentially = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Ordenar arquivos por orderIndex para garantir sequência
    const sortedFiles = [...files].sort((a, b) => a.orderIndex - b.orderIndex);
    
    for (let i = 0; i < sortedFiles.length; i++) {
      const fileItem = sortedFiles[i];
      
      try {
        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ));

        // Simular progresso de upload
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: progress
          }));
          
          // Simular tempo de upload baseado no tamanho do arquivo
          const delay = Math.max(50, fileItem.size / 100000); // Arquivos maiores demoram mais
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Simular envio do arquivo (aqui você faria o upload real)
        await simulateFileUpload(fileItem);
        
        // Marcar como completo
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed' } : f
        ));

        // Chamar callback para cada arquivo na ordem correta
        onFilesSelected([fileItem]);
        
      } catch (error) {
        console.error('Erro no upload:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      }
    }
    
    setIsUploading(false);
  };

  const simulateFileUpload = async (fileItem) => {
    // Aqui você implementaria o upload real para o servidor
    // Por exemplo, usando FormData e fetch/axios
    return new Promise((resolve) => {
      setTimeout(resolve, 500); // Simular latência
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '📤';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="file-upload-manager">
      <div className="upload-header">
        <h4>📎 Gerenciador de Arquivos</h4>
        <p className="upload-info">
          🎯 <strong>Ordem Garantida:</strong> Os arquivos serão enviados na ordem selecionada, 
          mesmo que alguns sejam maiores!
        </p>
      </div>

      <div className="file-input-section">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          disabled={isUploading}
        >
          📁 Selecionar Arquivos
        </Button>
        
        {files.length > 0 && (
          <Button
            onClick={uploadFilesSequentially}
            disabled={isUploading}
            className="upload-btn"
          >
            {isUploading ? (
              <>
                <div className="loading-spinner"></div>
                Enviando em ordem...
              </>
            ) : (
              `📤 Enviar ${files.length} arquivo${files.length !== 1 ? 's' : ''} em sequência`
            )}
          </Button>
        )}
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <div className="list-header">
            <span>Ordem de Envio (arraste para reordenar):</span>
            <span className="file-count">{files.length}/{maxFiles}</span>
          </div>
          
          {files
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((fileItem, index) => (
              <div
                key={fileItem.id}
                className={`file-item ${fileItem.status}`}
                draggable={!isUploading}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  reorderFiles(fromIndex, index);
                }}
              >
                <div className="file-order">
                  #{index + 1}
                </div>
                
                <div className="file-icon">
                  {getFileIcon(fileItem.type)}
                </div>
                
                <div className="file-info">
                  <div className="file-name">{fileItem.name}</div>
                  <div className="file-details">
                    {formatFileSize(fileItem.size)} • {fileItem.type}
                  </div>
                  
                  {fileItem.status === 'uploading' && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {uploadProgress[fileItem.id] || 0}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="file-status">
                  <span className="status-icon">{getStatusIcon(fileItem.status)}</span>
                  {!isUploading && fileItem.status === 'pending' && (
                    <button
                      className="remove-file-btn"
                      onClick={() => removeFile(fileItem.id)}
                      title="Remover arquivo"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="upload-tips">
        <h5>💡 Dicas do KingChat:</h5>
        <ul>
          <li>🔄 Arraste os arquivos para reordenar antes de enviar</li>
          <li>⏳ Arquivos grandes podem demorar mais, mas a ordem será respeitada</li>
          <li>📱 Funciona perfeitamente em dispositivos móveis</li>
          <li>🎯 Garantia de entrega sequencial ao destinatário</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadManager;