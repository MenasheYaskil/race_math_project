import React from 'react';
import Button from './Button';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, title = 'Innovative Learning Race' }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    Cookies.remove(COOKIE_TEACHER_TOKEN);
    navigate('/');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <h2>{title}</h2>
        {Cookies.get(COOKIE_TEACHER_TOKEN) && (
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        )}
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
