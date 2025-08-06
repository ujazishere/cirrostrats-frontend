import React, { useState } from "react";
import { db } from '../firebase'; // Ensure this path is correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../components/CSS/Contact.css'; // Import the new CSS file

const Contact = () => {
  // State for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  // State to manage submission status and feedback messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' }); // 'success' or 'error'

  /**
   * Handles the form submission to Firebase.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic client-side validation
    if (!name.trim() || !email.trim() || !feedbackMessage.trim()) {
      setSubmitStatus({ message: 'Please fill out all required fields.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ message: '', type: '' });

    try {
      // Data object to be sent to Firestore.
      // This matches the structure from your original feedback form,
      // but uses 'name' and 'email' instead of a logged-in user.
      const feedbackData = {
        name: name.trim(),
        email: email.trim(),
        type: feedbackType,
        message: feedbackMessage.trim(),
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        source: 'Contact Page' // Added to differentiate from popup feedback
      };

      await addDoc(collection(db, "feedback"), feedbackData);

      // On successful submission
      setSubmitStatus({ message: 'Thank you! Your message has been sent successfully.', type: 'success' });
      
      // Reset form fields
      setName("");
      setEmail("");
      setFeedbackType("General Feedback");
      setFeedbackMessage("");

    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      setSubmitStatus({ message: 'Sorry, there was an error. Please try again later.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="contact-card">
        
        <div className="contact-header">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            We're here to help. Whether you have a question, a bug to report, or a feature idea, we'd love to hear from you.
          </p>
        </div>
        
        <div className="contact-form-wrapper">
          <form onSubmit={handleSubmit} className="contact-form" noValidate>
            
            {/* Form Fields */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name" className="form-label">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="email" className="form-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="feedbackType" className="form-label">Inquiry Type</label>
              <select
                id="feedbackType"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="form-select"
              >
                <option value="General Feedback">General Feedback</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Support">Support Inquiry</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="message" className="form-label">Message *</label>
              <textarea
                id="message"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                className="form-textarea"
                rows="6"
                required
              />
            </div>

            {/* Submission Feedback Message */}
            {submitStatus.message && (
              <div className={`form-status-message ${submitStatus.type}`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="form-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg className="submit-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;