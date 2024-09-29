import React, { useEffect, useRef, useState } from 'react';
import { initDetection } from '../index123'; // Ensure the path is correct
import "../styles.css";
import { useNavigate } from 'react-router-dom';
const FacePhoneDetection = () => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const navigate = useNavigate();

  useEffect(() => {
    const videoElement = videoRef.current;

    // Initialize face and phone detection
    if (videoElement) {
      initDetection(videoElement, setStatus, navigate);
    }
  }, []);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="video-element"
      ></video>

      {/* Status box positioned below the video element */}
      <div className="status-box">{status}</div>
    </div>
  );
};

export default FacePhoneDetection;
