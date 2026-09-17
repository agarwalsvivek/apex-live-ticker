import './app.css';
import HeaderTickers from './components/header-tickers';
import LaunchCountdown from './components/launch/launch-count-down';

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

        <HeaderTickers />
        <div className="header-nav">
          <button>‹</button>
          <button>›</button>
        </div>
      </header>

      <main className="page">
        <LaunchCountdown />
      </main>
    </div>
  );
}

export default App;
