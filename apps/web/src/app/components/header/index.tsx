import StockSearch from '../stock-search/StockSearch';

const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        <span className="icon" role="img" aria-label="Global markets">
          🌐
        </span>
        Apex finance
      </div>
      <StockSearch />
    </header>
  );
};

export default Header;
