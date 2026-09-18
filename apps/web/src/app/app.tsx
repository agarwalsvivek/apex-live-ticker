import './app.css';
import Header from './components/header';
import TickerList from './components/ticker-list';
import LaunchCountdown from './components/launch/launch-count-down';
import RecentlyViewed from './components/recently-viewed/RecentlyViewed';

export function App() {
  return (
    <div className="app">
      <Header />
      <main className="page">
        <TickerList />
        <LaunchCountdown />
        <RecentlyViewed />
      </main>
    </div>
  );
}

export default App;
