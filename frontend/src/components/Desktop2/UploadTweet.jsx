import React from "react";
import { Link } from "react-router-dom";

function UploadTweet(props) {
  return (
    <div>
      <Link to="/deployTweet" className="launch_app">
        <b>Upload Tweet</b>
      </Link>
    </div>
  );
}

export default UploadTweet;
