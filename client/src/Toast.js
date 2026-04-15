import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'ERROR';
      case 'success':
        return 'SUCCESS';
      case 'warning':
        return 'WARNING';
      default:
        return 'INFO';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
