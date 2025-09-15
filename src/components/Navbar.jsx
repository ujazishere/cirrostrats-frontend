import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import LogoImage from '/logo.png'; // Note the updated import path

// Defines the Navbar functional component, which serves as the main navigation for the website.
const Navbar = () => {
  // State to control sidebar visibility
  // This state determines whether the mobile navigation menu (sidebar) is open or closed.
  const [showLinks, setShowLinks] = useState(false);
  
  // Refs for click-outside detection
  // These refs are used to get direct references to the DOM elements of the sidebar, overlay, and hamburger menu.
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const hamburgerRef = useRef(null);

  /**
   * Toggles the sidebar open/closed state
   */
  // This function handles the click event on the hamburger menu.
  const toggleSidebar = (event) => {
    // Prevent event from propagating to document
    // This stops the click from bubbling up to the document, which would be caught by the 'handleClickOutside' listener and immediately close the sidebar.
    event.stopPropagation();
    // This updates the state by toggling the previous value, ensuring a safe state transition.
    setShowLinks(prev => !prev);
  };

  /**
   * Closes the sidebar
   */
  // A dedicated function to explicitly close the sidebar.
  const closeSidebar = () => {
    // Sets the visibility state to false.
    setShowLinks(false);
  };

  /**
   * Effect to handle clicks outside the sidebar
   * Closes the sidebar when clicking outside
   */
  // This useEffect hook manages the "click outside" functionality to close the mobile menu.
  useEffect(() => {
    // Defines the function that will be executed on every mousedown event in the document.
    const handleClickOutside = (event) => {
      // Check if click is outside sidebar, overlay, and hamburger
      // This condition checks if the clicked element (event.target) is NOT inside the sidebar, the overlay, or the hamburger menu itself.
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) && 
        overlayRef.current && 
        !overlayRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        // If the click was outside all these elements, it calls the function to close the sidebar.
        closeSidebar();
      }
    };

    // Add and remove event listener
    // Adds the event listener to the entire document when the component mounts.
    document.addEventListener("mousedown", handleClickOutside);
    // The return function is a cleanup function that React runs when the component unmounts.
    // This is crucial to prevent memory leaks by removing the listener.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // The empty dependency array ensures this effect runs only once on mount and cleans up on unmount.

  // The return statement contains the JSX that defines the component's UI.
  return (
    // This is the main container for the entire navbar.
    <div className="navbar">
      {/* Logo Link */}
      {/* This NavLink component acts as a link to the homepage. */}
      <NavLink
        to="/"
        className="navbar__logo"
        // Clicking the logo also closes the sidebar, which is good UX on mobile.
        onClick={closeSidebar}
      >
        <img 
          src={LogoImage} 
          alt="Cirrostrats Logo" 
          className="navbar__logo-image"
        />
      </NavLink>

      {/* Mobile Menu Toggle Button */}
      {/* This is the "hamburger" menu icon that is typically visible on mobile devices. */}
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
      {/* This is a semi-transparent background that appears when the sidebar is open, and it is conditionally rendered. */}
      {showLinks && (
        <div 
          className="sidebar-overlay" 
          ref={overlayRef} 
          // Clicking the overlay provides another way to close the sidebar.
          onClick={closeSidebar}
        ></div>
      )}

      {/* Navigation Links */}
      {/* This nav element contains the main list of navigation links and acts as the sidebar on mobile. */}
      <nav 
        // The className is dynamic: 'open' or 'closed' is applied based on the 'showLinks' state, allowing CSS to control its visibility and animation.
        className={`navbar__nav ${showLinks ? "open" : "closed"}`} 
        ref={sidebarRef}
      >
        <ul className="navbar__list">
          {/* Homepage Link */}
          <li className="navbar__list__item">
            <NavLink
              to="homepage"
              // The className prop of NavLink can be a function that receives the active state.
              // This allows for applying an 'active' class when the link's route matches the current URL.
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
        </ul>
      </nav>
    </div>
  );
};

// Exports the Navbar component to be used in other parts of the application.
export default Navbar;