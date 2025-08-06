import React, { useState, useEffect } from 'react';
import './FileUploader.css';
import { useNavigate } from 'react-router-dom';

const FileUploader = ({ label, attachments = [] }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Helper: Determine if base64
  const isBase64 = (str) => /^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length > 100;

  // Format attachments for consistent handling
  useEffect(() => {
    const processed = attachments.map((item) => {
      const isImage = item.startsWith('data:image') || item.endsWith('.jpg') || item.endsWith('.png') || isBase64(item);
      const isPDF = item.startsWith('data:application/pdf') || item.endsWith('.pdf');

      if (isImage) {
        return {
          type: 'image',
          name: 'Image',
          path: isBase64(item) ? `data:image/png;base64,${item}` : item,
        };
      } else if (isPDF) {
        return {
          type: 'application/pdf',
          name: 'PDF',
          path: item,
        };
      } else {
        return {
          type: 'unsupported',
          name: 'Unsupported File',
          path: item,
        };
      }
    });

    setFiles(processed);
  }, [attachments]);

  // Render icon based on file type
  const getFileIcon = (file) => {
    if (file.type === 'image') {
      return <img src={file.path} alt={file.name} width={100} className="border rounded" />;
    } else if (file.type === 'application/pdf') {
      return <img src="/icons/pdf.png" alt="PDF Icon" width={80} />;
    } else {
      return <div className="text-danger">Unsupported</div>;
    }
  };

  // Preview handler
  const handleFileClick = (file) => {
    if (file.type === 'application/pdf' && isMobile) {
      window.open(file.path, '_blank');
    } else if (file.type !== 'unsupported') {
      setPreviewFile(file);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const handleCloseOrBack = () => {
    if (previewFile) {
      closePreview();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="upload-boxes-scroll d-flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div className="upload-placeholder-wrapper" key={index}>
            <div className="upload-placeholder" onClick={() => handleFileClick(file)}>
              {getFileIcon(file)}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseOrBack}>×</button>
            {previewFile.type === 'image' ? (
              <img src={previewFile.path} alt="Preview" className="modal-image" />
            ) : previewFile.type === 'application/pdf' ? (
              <iframe src={previewFile.path} title="PDF Preview" className="modal-iframe" />
            ) : (
              <p>{previewFile.name}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
