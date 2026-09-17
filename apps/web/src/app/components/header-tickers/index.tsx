type TickerDirection = 'up' | 'down';

interface Ticker {
  name: string;
  price: string;
  change: string;
  direction: TickerDirection;
  sparkPoints: string;
}

const TICKERS: Ticker[] = [
  {
    name: 'Dow Futures',
    price: '52,605.00',
    change: '+79.00 +0.15%',
    direction: 'up',
    sparkPoints: '0,20 8,18 16,14 24,16 32,10 40,12 52,6',
  },
  {
    name: 'Nasdaq Futures',
    price: '29,374.25',
    change: '+127.50 +0.44%',
    direction: 'up',
    sparkPoints: '0,22 8,18 16,12 24,15 32,9 40,11 52,5',
  },
  {
    name: 'Russell 2000 Futures',
    price: '2,899.40',
    change: '+4.70 +0.16%',
    direction: 'up',
    sparkPoints: '0,20 8,16 16,14 24,18 32,12 40,10 52,8',
  },
  {
    name: 'VIX',
    price: '16.80',
    change: '-0.40 -2.33%',
    direction: 'down',
    sparkPoints: '0,8 8,10 16,14 24,12 32,18 40,20 52,22',
  },
  {
    name: 'Gold',
    price: '4,384.90',
    change: '+52.10 +1.20%',
    direction: 'up',
    sparkPoints: '0,20 8,17 16,14 24,16 32,11 40,8 52,6',
  },
  {
    name: 'Crude Oil Oct 26',
    price: '103.95',
    change: '-1.88 -1.78%',
    direction: 'down',
    sparkPoints: '0,10 8,14 16,18 24,14 32,20 40,22 52,24',
  },
];

const SPARK_COLOR: Record<TickerDirection, string> = {
  up: '#0a7c3e',
  down: '#c0392b',
};

const HeaderTickers = () => {
  return (
    <div className="header-tickers">
      {TICKERS.map((ticker) => (
        <div className="header-ticker" key={ticker.name}>
          <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
            <polyline
              points={ticker.sparkPoints}
              stroke={SPARK_COLOR[ticker.direction]}
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <div className="ht-info">
            <div className="ht-name">{ticker.name}</div>
            <div className="ht-price">{ticker.price}</div>
            <div className={`ht-chg ${ticker.direction}`}>{ticker.change}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeaderTickers;
