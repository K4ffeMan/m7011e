import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import "./header.css";

import { FaGithub } from "react-icons/fa"; // FontAwesome GitHub icon

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="header">
      {/* Left: Menu Button */}
      <button
        onClick={toggleMenu}
        className="header__menu-button"
        aria-label="Main menu"
      >
        <Menu size={24} />
      </button>

      {/* Right: Auth Buttons */}
      <div className="header__auth">
        <Link to="/login" className="login">
          Log In
        </Link>
        <Link to="/register" className="register">
          Register
        </Link>
      </div>

      {/* Optional dropdown */}
      {isOpen && (
        <div className="header__dropdown">
          <Link to="/" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="https://github.com/K4ffeMan/m7011e" onClick={toggleMenu}>
            Github 
             <FaGithub className="text-gray-700" />
          </Link>
          
        </div>
      )}
    </header>
  );
};

export default Header;
