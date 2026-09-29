import { useEffect, useState } from 'react';

function getTimeLeft(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export default function CountdownTimer({ target, onExpire }) {
  const [left, setLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => {
      const next = getTimeLeft(target);
      setLeft(next);
      if (!next && onExpire) onExpire();
    }, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  if (!left) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <span className="countdown">
      {left.days > 0 && `${left.days}${'د'} `}
      {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}
    </span>
  );
}
