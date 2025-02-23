import React from "react";
import "./aboutPage.scss";

function AboutPage() {
  return (
    <div className="aboutPage">
      <div className="banner">
        <h1>About Jagga Sansaar</h1>
        <p>Your Trusted Partner in Real Estate</p>
      </div>
      
      <div className="aboutContainer">
        <div className="section">
          <h2>Our Story</h2>
          <p>
            Founded in 2023, Jagga Sansaar has quickly established itself as a leading 
            real estate platform in the region. We started with a simple mission - to 
            make property transactions transparent, efficient, and accessible to everyone.
          </p>
          <p>
            Our platform brings together buyers, sellers, and renters on a single 
            trustworthy marketplace where finding your dream property or listing your 
            property for sale or rent is just a few clicks away.
          </p>
        </div>
        
        <div className="section">
          <h2>Our Vision</h2>
          <p>
            We envision a world where property transactions are seamless, transparent, 
            and accessible to everyone. We aim to revolutionize the real estate industry 
            by leveraging technology to simplify complex processes and create value for 
            all our users.
          </p>
        </div>
        
        <div className="section twoColumn">
          <div className="column">
            <h2>What We Offer</h2>
            <ul>
              <li>Extensive listing of properties for sale and rent</li>
              <li>Direct communication with property owners</li>
              <li>Verified property information</li>
              <li>User-friendly interface</li>
              <li>Dedicated customer support</li>
            </ul>
          </div>
          <div className="column">
            <h2>Our Values</h2>
            <ul>
              <li>Transparency in all our operations</li>
              <li>Integrity in our business practices</li>
              <li>Excellence in customer service</li>
              <li>Innovation in technology</li>
              <li>Accessibility for all users</li>
            </ul>
          </div>
        </div>
        
        <div className="section">
          <h2>Our Team</h2>
          <p>
            Behind Jagga Sansaar is a team of passionate professionals from diverse 
            backgrounds including real estate, technology, design, and customer service. 
            We are united by our commitment to transform the real estate industry and 
            provide exceptional service to our users.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage; 