import React from 'react';
import { Link } from 'react-router-dom';
import './successfulBookingPage.scss'; // Create this file for styling if needed

function SuccessfulBookingPage() {
  return (
    <div className="successfulBookingPage">
      <div className="successContent">
        <img src="/success-icon.png" alt="Success" className="successIcon" /> {/* Add a success icon if you have one */}
        <h1>Booking Successful!</h1>
        <p>Your payment has been processed and the property booking is confirmed.</p>
        <p>Thank you for choosing JaggaSansaar.</p>
        <div className="actions">
          <Link to="/list" className="actionButton">View More Properties</Link>
          <Link to="/profile" className="actionButton">Go to My Profile</Link> {/* Link to profile if applicable */}
        </div>
      </div>
    </div>
  );
}

export default SuccessfulBookingPage; 