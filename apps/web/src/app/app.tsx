import './app.css';
import Header from './components/header';
import TickerList from './components/ticker-list';
import LaunchCountdown from './components/launch/launch-count-down';
import RecentlyViewed from './components/recently-viewed/RecentlyViewed';
import StockSearch from './components/stock-search/StockSearch';

export function App() {
  return (
    <div className="app">
      <Header />
      <main className="page">
        <TickerList />
        <StockSearch />
        <RecentlyViewed />
        <LaunchCountdown />
      </main>
    </div>
  );
}

export default App;
