import React, { createContext, useContext, useState } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationsContextValue {
  notify: (message: string, type?: Notification['type']) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string, type: Notification['type'] = 'info') => {
    const id = Date.now();
    setNotifications(n => [...n, { id, message, type }]);
    setTimeout(() => setNotifications(n => n.filter(notif => notif.id !== id)), 3000);
  };

  return (
    <NotificationsContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded shadow text-white ${
              n.type === 'error'
                ? 'bg-red-600'
                : n.type === 'success'
                ? 'bg-green-600'
                : 'bg-gray-800'
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
};
