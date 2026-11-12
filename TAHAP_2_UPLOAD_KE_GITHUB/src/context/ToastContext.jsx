import React, { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer, LevelUpModal } from '../components/ui/Toast';
import { fireMiniConfetti } from '../lib/confetti';
import { sfx } from '../lib/soundEffects';

const ToastContext = createContext({
  toast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [levelUpData, setLevelUpData] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'success', title, desc = '', xp = null }) => {
      const id = `${Date.now()}-${Math.random()}`;
      const xpGained = typeof xp === 'number' ? xp : xp?.gained || 0;

      if (xp && typeof xp === 'object' && xp.leveledUp && xp.level) {
        sfx.celebrationFanfare();
      } else if (type === 'error' || type === 'warning') {
        sfx.errorBuzz();
      } else if (xpGained > 0 || type === 'success') {
        sfx.xpGain();
      }

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          title,
          desc,
          xpGained,
        },
      ]);

      if (xp && typeof xp === 'object' && xp.leveledUp && xp.level) {
        setLevelUpData(xp.level);
        fireMiniConfetti();
      }

      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <LevelUpModal level={levelUpData} onClose={() => setLevelUpData(null)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
