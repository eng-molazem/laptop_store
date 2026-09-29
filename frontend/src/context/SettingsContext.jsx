import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../api/public';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const reload = () => getSettings().then(setSettings).catch(() => {});

  useEffect(() => {
    reload();
  }, []);

  return <SettingsContext.Provider value={{ settings, reload }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
