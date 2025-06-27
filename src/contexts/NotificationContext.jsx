import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return 'denied';
    }
  };

  const showNotification = (title, options = {}) => {
    if (notificationPermission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options
        });
      } catch (error) {
        console.error('알림 표시 실패:', error);
      }
    }
  };

  useEffect(() => {
    setNotificationPermission(Notification.permission);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notificationPermission,
      requestPermission,
      showNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 