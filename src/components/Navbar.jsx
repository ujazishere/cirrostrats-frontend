/**
 * Responsive Navigation Bar Component
 * 
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Sliding sidebar for mobile navigation
 * - Click-outside detection to close sidebar
 * - Active route highlighting
 * - Smooth transitions for menu open/close
 * 
 * The component provides navigation links to different sections of the application
 * and includes a mobile-friendly sidebar that can be toggled with a hamburger menu.
 */

import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  // State to control sidebar visibility
  const [showLinks, setShowLinks] = useState(false);
  
  // Refs for click-outside detection
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  /**
   * Toggles the sidebar open/closed state
   */
  const toggleSidebar = () => {
    setShowLinks(prev => !prev);
  };

  /**
   * Closes the sidebar
   */
  const closeSidebar = () => {
    setShowLinks(false);
  };

  /**
   * Effect to handle clicks outside the sidebar
   * Closes the sidebar when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both sidebar and overlay
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) && 
        overlayRef.current && 
        !overlayRef.current.contains(event.target)
      ) {
        closeSidebar();
      }
    };

    // Add and remove event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      {/* Logo/Brand Link */}
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

      {/* Mobile Menu Toggle Button */}
      <span 
        className="material-symbols-outlined navbar__menu" 
        onClick={toggleSidebar}
      >
        menu
      </span>

      {/* Overlay for mobile sidebar */}
      {showLinks && (
        <div 
          className="sidebar-overlay" 
          ref={overlayRef} 
          onClick={closeSidebar}
        ></div>
      )}

      {/* Navigation Links */}
      <nav 
        className={`navbar__nav ${showLinks ? "open" : "closed"}`} 
        ref={sidebarRef}
      >
        <ul className="navbar__list">
          {/* Our Story Link */}
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

          {/* Contact Us Link */}
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

          {/* Source Link */}
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

          {/* Guide Link */}
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

          {/* Live Map External Link */}
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