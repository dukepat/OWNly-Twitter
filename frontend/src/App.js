import React from "react";
import Home from "./screens/Home";
import LandingScreen from "./screens/LandingScreen";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import "./App.css";
import DeployTweet from "./screens/DeployTweet";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<LandingScreen />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/deployTweet" element={<DeployTweet />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
