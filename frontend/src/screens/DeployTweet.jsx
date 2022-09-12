import axios from "axios";
import React, { createRef, useState } from "react";
import Gallery from "react-photo-gallery";

function DeployTweet(props) {
  const [tweetData, setTweetData] = useState(null);
  const [error, setError] = useState(false);
  const galleryRef = createRef();

  const image =
    tweetData && tweetData.includes && tweetData.includes.media
      ? [...tweetData.includes.media].map((tweetMedia) => {
          return { src: tweetMedia.url, width: 1, height: 1 };
        })
      : null;

  const fetchTweet = async (id) => {
    try {
      const response = await axios.get(`/tweetMedia?id=${id}`);
      return response;
    } catch (error) {
      return { message: "Something went wrong, please try again" };
    }
  };
  const displayTweetImage = async (e) => {
    try {
      e.preventDefault();
      const url = e.target.value;
      const id = url.split("/")[5];
      const { data, status } = await fetchTweet(id);
      if (data.message) {
        setError(true);
        setTweetData(null);
      } else {
        setTweetData(data.data);
        setError(false);
      }
    } catch (e) {
      setError(true);
      setTweetData(null);
    }
  };
  return (
    <div>
      <form>
        <input placeholder="Enter Tweet URL" onChange={displayTweetImage} />
        <input placeholder="Enter token feature" />
        <input placeholder="Enter transfer limit" />
        <input placeholder="Enter mint fee" />
      </form>
      {image && <Gallery photos={image} ref={galleryRef} />}
    </div>
  );
}

export default DeployTweet;
