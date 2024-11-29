import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [showLinks, setShowLinks] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newMode;
    });
  };

  const toggleSidebar = () => {
    setShowLinks(prev => !prev);
  };

  const closeSidebar = () => {
    setShowLinks(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          overlayRef.current && 
          !overlayRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar flex items-center justify-between px-4 py-2">
      <h2 className="text-2xl font-bold">
        <NavLink
          to="/"
          className="navbar__title text-2xl md:text-3xl lg:text-4xl"
          style={({ isActive }) => ({
            color: isActive ? "white" : "black",
            textDecoration: "none",
          })}
          onClick={closeSidebar}
        >
          Cirrostrats
        </NavLink>
      </h2>

      <span 
        className="material-symbols-outlined navbar__menu cursor-pointer"
        onClick={toggleSidebar}
      >
        menu
      </span>

      {showLinks && (
        <div className="sidebar-overlay" ref={overlayRef} onClick={closeSidebar}></div>
      )}

      <nav className={`navbar__nav ${showLinks ? "open" : "closed"}`} ref={sidebarRef}>
        <ul className="navbar__list flex flex-col space-y-4">
          <li className="navbar__list__item">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="story"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Our Story
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="contact"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Contact Us
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="source"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Source
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="guide"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Guide
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <a
              href="https://cirrostrats.us/live_map"
              className="navbar__list__item__link"
              onClick={closeSidebar}
            >
              Live Map
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;