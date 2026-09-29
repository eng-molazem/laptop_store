import { createContext, useContext } from 'react';

const GuestIdContext = createContext(null);

function getOrCreateGuestId() {
  let id = localStorage.getItem('guestId');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('guestId', id);
  }
  return id;
}

export function GuestIdProvider({ children }) {
  const guestId = getOrCreateGuestId();
  return <GuestIdContext.Provider value={guestId}>{children}</GuestIdContext.Provider>;
}

export function useGuestId() {
  return useContext(GuestIdContext);
}
