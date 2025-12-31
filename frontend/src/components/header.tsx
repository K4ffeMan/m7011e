import { Menu } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import "./header.css";

interface HeaderProps {
  authenticated: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  authenticated,
  onLogin,
  onRegister,
  onLogout,
}) => {
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
        {!authenticated ? (
          <>
            <button className="login" onClick={onLogin}>
              Log In
            </button>
            <button className="register" onClick={onRegister}>
              Register
            </button>
          </>
        ) : (
          <button className="logout" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="header__dropdown">
          <a href="/" onClick={toggleMenu}>Home</a>
          <a
            href="https://github.com/K4ffeMan/m7011e"
            target="_blank"
            rel="noreferrer"
            onClick={toggleMenu}
          >
            Github <FaGithub />
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
