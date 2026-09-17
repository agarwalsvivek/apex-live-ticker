const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        <span className="icon" role="img" aria-label="Global markets">
          🌐
        </span>
        Apex Stream
      </div>
      <div className="header-search">
        <input type="search" placeholder="Search stocks, ETFs & more" />
      </div>
    </header>
  );
};

export default Header;
