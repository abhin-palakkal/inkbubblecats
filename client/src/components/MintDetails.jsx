import { Cat, Gift, Users, CalendarDays, Gem } from 'lucide-react';
import './MintDetails.css';

const details = [
  {
    icon: Cat,
    label: 'Collection Supply',
    value: '3,333',
    description: 'Unique pixel cats',
  },
  {
    icon: Users,
    label: 'ChibInk Holders + Treasury',
    value: '500',
    description: 'Reserved allocation',
  },
  {
    icon: Gift,
    label: 'GTD Mint',
    value: '1,500',
    description: 'Free mint',
  },
  {
    icon: Gem,
    label: 'FCFS Mint',
    value: 'TBD',
    description: 'Remaining allocation',
  },
  {
    icon: Gem,
    label: 'Public Mint',
    value: 'TBD',
    description: 'Price to be announced',
  },
  {
    icon: CalendarDays,
    label: 'Mint Date',
    value: 'TBD',
    description: 'Stay tuned for updates',
  },
];

export default function MintDetails() {
  return (
    <section className="mint-details-section section-wrap" id="mint-details">
      <div className="section-kicker">
        <span className="pixel-dot" />
        THE ESSENTIALS
      </div>

      <h2 className="section-title mint-details-title">
        MINT <span>DETAILS.</span>
      </h2>

      <p className="mint-details-intro">
        Everything you need to know before the mint.
      </p>

      <div className="mint-details-list">
        {details.map(({ icon: Icon, label, value, description }) => (
          <article className="mint-detail-row" key={label}>
            <div className="mint-detail-icon">
              <Icon size={19} />
            </div>

            <div className="mint-detail-info">
              <h3>{label}</h3>
              <p>{description}</p>
            </div>

            <div className="mint-detail-value">{value}</div>
          </article>
        ))}
      </div>

      <div className="mint-details-note">
        <span>✦</span>
        Follow us on X for mint updates and announcements.
      </div>
    </section>
  );
}
