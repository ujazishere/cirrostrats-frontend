import React from 'react';

const FeedbackPopup = ({ 
  onClose, 
  feedbackType, 
  setFeedbackType, 
  feedbackMessage, 
  setFeedbackMessage,
  onSubmit,
  isSubmitting
}) => {
  return (
    <div className="feedback-overlay">
      <div className="feedback-popup">
        <div className="feedback-header">
          <h2 className="feedback-title">Send us your feedback</h2>
          <button onClick={onClose} className="feedback-close">
            ✕
          </button>
        </div>
        
        <div className="feedback-content">
          <div className="feedback-field">
            <label className="feedback-label">Type of feedback</label>
            <select 
              value={feedbackType} 
              onChange={(e) => setFeedbackType(e.target.value)}
              className="feedback-select"
            >
              <option value="General Feedback">General Feedback</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div className="feedback-field">
            <label className="feedback-label">Your message</label>
            <textarea 
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Please describe your feedback, feature request, or issue in detail..."
              className="feedback-textarea"
            />
          </div>
        </div>

        <div className="feedback-actions">
          <button onClick={onClose} className="feedback-cancel">
            Cancel
          </button>
          <button 
            onClick={onSubmit} 
            className="feedback-submit"
            disabled={!feedbackMessage.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;