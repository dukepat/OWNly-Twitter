import React, { useEffect } from "react";
import {
  About,
  Description,
  Ecosystem,
  Features,
  Navbar,
} from "../components/Desktop1";
import { useMoralis } from "react-moralis";
import { useNavigate } from "react-router-dom";

function LandingScreen(props) {
  const navigate = useNavigate();
  const { isAuthenticated } = useMoralis();
  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated]);
  return (
    <div className="Desktop1">
      <Navbar />
      <About />
      <Description />
      <Features />
      <Ecosystem />
    </div>
  );
}

export default LandingScreen;
