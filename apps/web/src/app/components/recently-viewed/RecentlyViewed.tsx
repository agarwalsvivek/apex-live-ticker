import { useEffect, useState } from 'react';

const WS_URL = 'wss://translator.agarwalsvivek.com/ws';

type Ticker = {
  price: number;
  prevValue: number | undefined;
};

const RecentlyViewed = () => {
  const [mapOfTickers, setMapOfTickers] = useState<Map<string, Ticker>>(
    new Map(),
  );

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (e) => {
      const json = JSON.parse(e.data);

      if (Array.isArray(json.data)) {
        setMapOfTickers((prevMap) => {
          const map = new Map(prevMap);
          for (const { symbol, price } of json.data) {
            map.set(symbol, {
              price,
              prevValue: prevMap.get(symbol)?.price,
            });
          }

          return map;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);
  return (
    <section className="section">
      <p>Recently Viewed...</p>
      <div style={{ display: 'grid', gap: '20px' }}>
        {[...mapOfTickers.entries()].map(([symbol, { price, prevValue }]) => {
          const flashClass =
            prevValue === undefined
              ? ''
              : price > prevValue
                ? 'price-flash-up'
                : price < prevValue
                  ? 'price-flash-down'
                  : '';

          return (
            <div
              key={symbol}
              style={{
                display: 'grid',
                gap: '20px',
                gridTemplate: 'auto / 1fr 1fr',
              }}
            >
              <span className="ticker-label">{symbol} : </span>
              <span key={price} className={flashClass}>
                {Number(price).toFixed(3)}{' '}
              </span>
              {/* <span>{Number(prevValue).toFixed(3)}</span> */}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
