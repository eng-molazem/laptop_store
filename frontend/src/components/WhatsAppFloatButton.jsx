import { useSettings } from '../context/SettingsContext';
import './WhatsAppFloatButton.css';

export default function WhatsAppFloatButton() {
  const { settings } = useSettings();
  const number = settings?.socialLinks?.whatsapp;
  if (!number) return null;

  const digits = number.replace(/[^0-9]/g, '');
  const href = `https://wa.me/${digits}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="WhatsApp">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
        <path d="M16.02 3C9.4 3 4 8.35 4 14.93c0 2.36.66 4.56 1.8 6.44L4 29l7.86-2.06a12.9 12.9 0 0 0 4.16.7c6.63 0 12.02-5.35 12.02-11.93S22.65 3 16.02 3zm0 21.6c-1.35 0-2.66-.27-3.85-.79l-.28-.13-4.66 1.22 1.24-4.55-.18-.29a9.72 9.72 0 0 1-1.5-5.13c0-5.35 4.4-9.7 9.83-9.7 5.42 0 9.83 4.35 9.83 9.7s-4.41 9.67-9.83 9.67zm5.4-7.28c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
