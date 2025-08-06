import React from "react";
import '../components/CSS/Story.css';

const Story = () => {
  return (
    <div className="story-container">
      <div className="story">
        <div className="story-header">
          <h1 className="story__title">Welcome to Our Story</h1>
          <div className="story__divider"></div>
        </div>
        
        <div className="story-content">
          <div className="story__section">
            <p className="story__description">
              In the bustling world of aviation, where every minute counts, we saw the need for a powerful utility tool
              designed specifically for pilots. We wanted to create a platform that would declutter your workspace, enhance
              your planning capabilities, and provide invaluable decision-making support, all in one place.
            </p>
          </div>

          <div className="story__section">
            <p className="story__description">
              With unwavering dedication, we embarked on a mission to redefine efficiency and elevate your flying experience
              to new heights.
            </p>
          </div>
          <div className="story__section">
            <p className="story__description">
              Our utility tool is a testament to our commitment to innovation and efficiency. It combines cutting-edge
              technology with an intuitive interface, ensuring that you have access to the most relevant aviation information
              at your fingertips. Weather updates, gate statuses, route checks, crosswind checks, and so much more—all
              seamlessly integrated into a single, simple, comprehensive solution.
            </p>
          </div>
          <div className="story__section">
            <p className="story__description">
              We collaborate with pilots like you, incorporating your valuable feedback and insights, ensuring that our
              utility tool remains your trusted companion in the flightdeck.
            </p>
          </div>
          <div className="story__section">
            <p className="story__description">
              We believe that by simplifying and streamlining your workflow, we can empower you to focus on what truly
              matters—the safe and efficient operation of your flights.
            </p>
          </div>
          <div className="story__section">
            <p className="story__description">
              Join us on this remarkable journey as we redefine the way pilots navigate the complexities of their profession.
              Together, let's embrace the boundless possibilities that await us in the endless blue skies.
            </p>
          </div>
          <div className="welcome-message">
            <h3 className="story__subtitle">Welcome aboard!</h3>
          </div>
        </div>

        <div className="team-section">
          <div className="team-grid">
            <div className="team-card">
              <h3 className="team__title">Our Team</h3>
              <div className="team__divider"></div>
              <div className="team__members">
                <div className="team__member">
                  <span className="member__name">Ujas Vaghani</span>
                  <span className="member__role">CEO</span>
                </div>
                <div className="team__member">
                  <span className="member__name">Ismail Sakhani</span>
                  <span className="member__role">Frontend Developer</span>
                </div>
              </div>
            </div>

            <div className="team-card">
              <h3 className="team__title">Contributors</h3>
              <div className="team__divider"></div>
              <div className="team__members">
                <div className="team__member">
                  <span className="member__name">Luis Arevalo</span>
                  <span className="member__role">Frontend Developer</span>
                </div>
                <div className="team__member">
                  <span className="member__name">Miles Wiesenthal</span>
                  <span className="member__role">Full Stack Developer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;