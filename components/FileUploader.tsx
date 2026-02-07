
import React, { useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (base64: string) => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress large images client-side to reduce payload size and avoid
      // hitting serverless function body limits.
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        img.onload = () => {
          const MAX_DIM = 1600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          onFileSelect(compressed);
        };
        img.onerror = () => {
          // fallback to original if image fails to load/compress
          onFileSelect(src);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={!disabled ? triggerUpload : undefined}
      className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf" // Support image/pdf for UI, though logic handles image
      />
      <div className={`p-4 rounded-full ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform'}`}>
        <i className="fas fa-file-invoice text-3xl"></i>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900">Trascina qui la tua bolletta</h3>
        <p className="text-sm text-slate-500 mt-1">Carica una foto o uno screenshot della tua bolletta (PNG, JPG)</p>
      </div>
      <button 
        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all
          ${disabled ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
      >
        Seleziona File
      </button>
    </div>
  );
};

export default FileUploader;
