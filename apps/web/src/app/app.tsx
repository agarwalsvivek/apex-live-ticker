import './app.css';
import LaunchCountdown from './components/launch-count-down';

export function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-market-label">
          <span className="icon" role="img" aria-label="Global markets">
            🌐
          </span>
          Apex finance
        </div>

        <div className="header-tickers">
          <div className="header-ticker">
            <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
              <polyline
                points="0,20 8,18 16,14 24,16 32,10 40,12 52,6"
                stroke="#0a7c3e"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
            <div className="ht-info">
              <div className="ht-name">Dow Futures</div>
              <div className="ht-price">52,605.00</div>
              <div className="ht-chg up">+79.00 +0.15%</div>
            </div>
          </div>

          <div className="header-ticker">
            <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
              <polyline
                points="0,22 8,18 16,12 24,15 32,9 40,11 52,5"
                stroke="#0a7c3e"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
            <div className="ht-info">
              <div className="ht-name">Nasdaq Futures</div>
              <div className="ht-price">29,374.25</div>
              <div className="ht-chg up">+127.50 +0.44%</div>
            </div>
          </div>

          <div className="header-ticker">
            <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
              <polyline
                points="0,20 8,16 16,14 24,18 32,12 40,10 52,8"
                stroke="#0a7c3e"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
            <div className="ht-info">
              <div className="ht-name">Russell 2000 Futures</div>
              <div className="ht-price">2,899.40</div>
              <div className="ht-chg up">+4.70 +0.16%</div>
            </div>
          </div>

          <div className="header-ticker">
            <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
              <polyline
                points="0,8 8,10 16,14 24,12 32,18 40,20 52,22"
                stroke="#c0392b"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
            <div className="ht-info">
              <div className="ht-name">VIX</div>
              <div className="ht-price">16.80</div>
              <div className="ht-chg down">-0.40 -2.33%</div>
            </div>
          </div>

          <div className="header-ticker">
            <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
              <polyline
                points="0,20 8,17 16,14 24,16 32,11 40,8 52,6"
                stroke="#0a7c3e"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
            <div className="ht-info">
              <div className="ht-name">Gold</div>
              <div className="ht-price">4,384.90</div>
              <div className="ht-chg up">+52.10 +1.20%</div>
            </div>
          </div>

          <div className="header-ticker">
            <svg className="ht-spark" viewBox="0 0 52 28" fill="none">
              <polyline
                points="0,10 8,14 16,18 24,14 32,20 40,22 52,24"
                stroke="#c0392b"
                stroke-width="1.5"
                fill="none"
              />
            </svg>
            <div className="ht-info">
              <div className="ht-name">Crude Oil Oct 26</div>
              <div className="ht-price">103.95</div>
              <div className="ht-chg down">-1.88 -1.78%</div>
            </div>
          </div>
        </div>
        <div className="header-nav">
          <button>‹</button>
          <button>›</button>
        </div>
      </header>

      <main className="app-main">
        <LaunchCountdown />
      </main>
    </div>
  );
}

export default App;
