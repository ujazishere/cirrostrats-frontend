// Contact.jsx
// This React component renders a contact form allowing users to submit their name, email, and a message.
// It includes controlled inputs for real-time data handling and provides feedback upon successful form submission.

import React from "react";

const Contact = () => {
  // State to manage form input values
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  // Function to handle changes in input fields and update state
  const handleChange = (e) => {
    setForm({
      ...form, // Retain existing form data
      [e.target.name]: e.target.value, // Update the specific field being edited
    });
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Reset the form fields to their initial state
    setForm({
      name: "",
      email: "",
      message: "",
    });

    // Provide user feedback
    alert("Thank you for your message. We will get back to you soon!");
  };

  return (
    // Main container for the contact section
    <div className="contact">
      {/* Title and description */}
      <h2 className="contact__title">Contact Us</h2>
      <h3 className="contact__subtitle">Get in Touch</h3>
      <p className="contact__description">
        If you have any questions or inquiries, please feel free to contact us using the form below:
      </p>

      {/* Contact form */}
      <form action="" onSubmit={handleSubmit} className="contact__form">
        {/* Name input */}
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          onChange={(e) => handleChange(e)}
        />

        {/* Email input */}
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          onChange={(e) => handleChange(e)}
        />

        {/* Message textarea */}
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          required
          onChange={(e) => handleChange(e)}
        ></textarea>

        {/* Submit button */}
        <button type="submit" className="contact__submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contact;
