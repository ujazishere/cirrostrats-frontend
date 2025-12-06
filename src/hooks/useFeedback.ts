import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import flightService from "../components/utility/flightService";

interface UseFeedbackOptions {
  defaultFeedbackType?: string;
  context?: any; // Optional context object to include in feedback (e.g., searchValue)
  customTelegramMessage?: (userEmail: string, feedbackType: string, feedbackMessage: string, context?: any) => string;
}

interface UseFeedbackReturn {
  showFeedbackPopup: boolean;
  feedbackType: string;
  setFeedbackType: (type: string) => void;
  feedbackMessage: string;
  setFeedbackMessage: (message: string) => void;
  isSubmitting: boolean;
  userEmail: string;
  handleFeedbackClick: (e: React.MouseEvent) => void;
  handleCloseFeedback: () => void;
  handleSubmitFeedback: () => Promise<void>;
}

/**
 * Custom hook to manage feedback popup state and submission logic.
 * 
 * @param options - Configuration options for the feedback hook
 * @param options.defaultFeedbackType - Default feedback type (defaults to "General Feedback")
 * @param options.context - Optional context object to include in feedback submission
 * @param options.customTelegramMessage - Optional function to customize the Telegram notification message
 * @returns Object containing all feedback state and handlers
 */
const useFeedback = (options: UseFeedbackOptions = {}): UseFeedbackReturn => {
  const {
    defaultFeedbackType = "General Feedback",
    context,
    customTelegramMessage,
  } = options;

  // State management
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackType, setFeedbackType] = useState(defaultFeedbackType);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("Anonymous");

  // Load user email from localStorage on mount
  useEffect(() => {
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
  }, []);

  // Handler to open the feedback popup
  const handleFeedbackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowFeedbackPopup(true);
  }, []);

  // Handler to close the feedback popup and reset state
  const handleCloseFeedback = useCallback(() => {
    setShowFeedbackPopup(false);
    setFeedbackMessage("");
    setFeedbackType(defaultFeedbackType);
  }, [defaultFeedbackType]);

  // Handler to submit feedback
  const handleSubmitFeedback = useCallback(async () => {
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);

    try {
      // Add feedback document to Firestore
      await addDoc(collection(db, "feedback"), {
        user: userEmail,
        type: feedbackType,
        message: feedbackMessage,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        ...(context && { context: JSON.stringify(context) }),
      });

      // Format Telegram message
      const telegramMessage = customTelegramMessage
        ? customTelegramMessage(userEmail, feedbackType, feedbackMessage, context)
        : context
        ? `
        New Feedback Received! 📬
        ------------------------
        👤 User: ${userEmail}
        📝 Type: ${feedbackType}
        💬 Message: ${feedbackMessage}
        🔍 Context: ${JSON.stringify(context)}
      `
        : `
        New Feedback Received! 📬
        ------------------------
        👤 User: ${userEmail}
        📝 Type: ${feedbackType}
        💬 Message: ${feedbackMessage}
      `;

      // Send Telegram notification
      try {
        await flightService.postNotifications(telegramMessage);
      } catch (error) {
        console.error("Telegram notification failed:", error);
      }

      alert("Thank you! Your feedback has been submitted successfully.");
      handleCloseFeedback();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(
        "Sorry, there was an error submitting your feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [feedbackMessage, feedbackType, userEmail, context, customTelegramMessage, handleCloseFeedback]);

  return {
    showFeedbackPopup,
    feedbackType,
    setFeedbackType,
    feedbackMessage,
    setFeedbackMessage,
    isSubmitting,
    userEmail,
    handleFeedbackClick,
    handleCloseFeedback,
    handleSubmitFeedback,
  };
};

export default useFeedback;

