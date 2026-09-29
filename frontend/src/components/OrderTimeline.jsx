import { useTranslation } from 'react-i18next';
import './OrderTimeline.css';

const FLOW = ['awaiting_payment', 'payment_review', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderTimeline({ status }) {
  const { t } = useTranslation();

  if (status === 'rejected' || status === 'cancelled') {
    return (
      <div className="order-timeline rejected">
        <div className="timeline-step done error">
          <span className="timeline-dot">✕</span>
          <span className="timeline-label">{t(`order.status.${status}`)}</span>
        </div>
      </div>
    );
  }

  const currentIndex = FLOW.indexOf(status);

  return (
    <div className="order-timeline">
      {FLOW.map((step, i) => (
        <div key={step} className={`timeline-step ${i <= currentIndex ? 'done' : ''} ${i === currentIndex ? 'current' : ''}`}>
          <span className="timeline-dot">{i < currentIndex ? '✓' : i + 1}</span>
          <span className="timeline-label">{t(`order.status.${step}`)}</span>
          {i < FLOW.length - 1 && <span className="timeline-line" />}
        </div>
      ))}
    </div>
  );
}
