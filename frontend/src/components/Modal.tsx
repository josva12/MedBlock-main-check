import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClass?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, widthClass = 'max-w-lg' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full ${widthClass} mx-4 relative`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
