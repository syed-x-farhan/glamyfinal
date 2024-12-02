import React from 'react';
import './BottomNav.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShoppingCart, faBookmark, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom'; 

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink to="/home" className="nav-item" activeClassName="active">
                <FontAwesomeIcon icon={faHome} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/cart" className="nav-item" activeClassName="active">
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Cart</span>
            </NavLink>
            <NavLink to="/save" className="nav-item" activeClassName="active">
                <FontAwesomeIcon icon={faBookmark} />
                <span>Saved</span>
            </NavLink>
            <NavLink to="/search" className="nav-item" activeClassName="active">
                <FontAwesomeIcon icon={faSearch} />
                <span>Search</span>
            </NavLink>
            <NavLink to="/profile" className="nav-item" activeClassName="active">
                <FontAwesomeIcon icon={faUser} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;