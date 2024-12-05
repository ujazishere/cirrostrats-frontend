import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [showLinks, setShowLinks] = useState(false);
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  const toggleSidebar = () => {
    setShowLinks(prev => !prev);
  };

  const closeSidebar = () => {
    setShowLinks(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && overlayRef.current && !overlayRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <h2>
        <NavLink
          to="/"
          className="navbar__title"
          style={({ isActive }) => ({
            color: isActive ? "white" : "black",
            textDecoration: "none",
          })}
          onClick={closeSidebar}
        >
          Cirrostrats
        </NavLink>
      </h2>

      <span className="material-symbols-outlined navbar__menu" onClick={toggleSidebar}>
        menu
      </span>

      {showLinks && <div className="sidebar-overlay" ref={overlayRef} onClick={closeSidebar}></div>}

      <nav className={`navbar__nav ${showLinks ? "open" : "closed"}`} ref={sidebarRef}>
        <ul className="navbar__list">
          <li className="navbar__list__item">
            <NavLink
              to="story"
              className={({ isActive }) => (isActive ? "active" : "navbar__list__item__link")}
              onClick={closeSidebar}
            >
              Our Story
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="contact"
              className={({ isActive }) => (isActive ? "active" : "navbar__list__item__link")}
              onClick={closeSidebar}
            >
              Contact Us
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="source"
              className={({ isActive }) => (isActive ? "active" : "navbar__list__item__link")}
              onClick={closeSidebar}
            >
              Source
            </NavLink>
          </li>
          <li className="navbar__list__item">
            <NavLink
              to="guide"
              className={({ isActive }) => (isActive ? "active" : "navbar__list__item__link")}
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