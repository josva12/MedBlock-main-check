import React, { useEffect, useState } from 'react';

interface MessageBoxProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white font-semibold z-50 ${getBackgroundColor()}`}>
      {message}
    </div>
  );
};

export default MessageBox; 