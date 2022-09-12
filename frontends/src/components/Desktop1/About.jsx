import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <div className="text-center  about">
      <div className="gradient text-white">
        <p>OWNly, an Own and Share</p>
        <p>Copyright NFT Platform</p>
      </div>
      <div>
        <p className="about_text">
          You can choose to place a price on everything you own in the digital
          world and share the copyright.
        </p>
        <br />
      </div>
      <Link to="/home" className="launch_app">
        <b>Launch App</b>
      </Link>
    </div>
  );
};

export default About;
