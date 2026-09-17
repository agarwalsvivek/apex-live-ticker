import { useEffect, useState } from 'react';
import { getRemaining, LAUNCH_DATE, pad } from '../../common/utils';
import './launch.css';

const LaunchCountdown = () => {
  const [target] = useState(() => LAUNCH_DATE);
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="launch-countdown">
      <p>Launching soon.....</p>
      <div className="countdown-timer">
        <div className="countdown-unit">
          <span className="countdown-value">{pad(remaining.days)}</span>
          <span className="countdown-label">Days</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">{pad(remaining.hours)}</span>
          <span className="countdown-label">Hours</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">{pad(remaining.minutes)}</span>
          <span className="countdown-label">Minutes</span>
        </div>
        <div className="countdown-unit">
          <span className="countdown-value">{pad(remaining.seconds)}</span>
          <span className="countdown-label">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default LaunchCountdown;
