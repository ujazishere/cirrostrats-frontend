import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import LogoImage from "/logo.png"; // Note the updated import path

const Navbar: React.FC = () => {
  // State to control sidebar visibility
  const [showLinks, setShowLinks] = useState<boolean>(false);

  // Refs for click-outside detection
  const sidebarRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Toggles the sidebar open/closed state
   */
  const toggleSidebar = (event: React.MouseEvent): void => {
    // Prevent event from propagating to document
    event.stopPropagation();
    setShowLinks((prev) => !prev);
  };

  /**
   * Closes the sidebar
   */
  const closeSidebar = (): void => {
    setShowLinks(false);
  };

  /**
   * Effect to handle clicks outside the sidebar
   * Closes the sidebar when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // Check if click is outside sidebar, overlay, and hamburger
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
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
      {/* Logo Link */}
      <NavLink to="/" className="navbar__logo" onClick={closeSidebar}>
        <img
          src={LogoImage}
          alt="Cirrostrats Logo"
          className="navbar__logo-image"
        />
      </NavLink>

      {/* Mobile Menu Toggle Button */}
      <div
        ref={hamburgerRef}
        className="navbar__hamburger"
        onClick={toggleSidebar}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </div>

      {/* Overlay for sidebar */}
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
          {/* Homepage Link */}
          <li className="navbar__list__item">
            <NavLink
              to="homepage"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Home
            </NavLink>
          </li>

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

          {/* Live Map Link */}
          <li className="navbar__list__item">
            <NavLink
              to="livemap"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Live Map
            </NavLink>
          </li>

          {/* Terms and Conditions Link */}
                    <li className="navbar__list__item">
            <NavLink
              to="tnc"
              className={({ isActive }) =>
                isActive ? "active" : "navbar__list__item__link"
              }
              onClick={closeSidebar}
            >
              Terms and Conditions
            </NavLink>
          </li>

        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
