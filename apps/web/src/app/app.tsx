import './app.css';
import Header from './components/header';
import TickerList from './components/ticker-list';
import LaunchCountdown from './components/launch/launch-count-down';

export function App() {
  return (
    <div className="app">
      <Header />
      <main className="page">
        <TickerList />
        <LaunchCountdown />
      </main>
    </div>
  );
}

export default App;
