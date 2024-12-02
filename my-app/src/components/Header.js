import React from 'react';
import './Header.css'; 
import logo from '../assets/Glamy_Header_logo.png';
const Header = () => {
  return (
    <header className="glamy-header">
      <div className="glamy-logo">
        <img src={logo} alt="Glamy Logo" className="glamy-logo-image" />
      </div>
    </header>
  );
}

export default Header;
