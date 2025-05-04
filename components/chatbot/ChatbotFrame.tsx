"use client";

import React, { useEffect, useState } from 'react';

interface ChatbotFrameProps {
  closeChat: () => void;
}

const ChatbotFrame: React.FC<ChatbotFrameProps> = ({ closeChat }) => {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);
    
    // Update width when window is resized
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get the base URL dynamically
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const chatbotUrl = `${origin}/chatbot/index.html`;
  
  // Calculate frame width (1/3 of screen width, min 320px, max 500px)
  const frameWidth = Math.max(
    Math.min(Math.floor(windowWidth / 3), 500),
    320
  );
  
  return (
    <div 
      className="fixed bottom-20 right-6 z-40 flex flex-col rounded-lg shadow-2xl bg-white overflow-hidden"
      style={{ 
        width: `${frameWidth}px`, 
        height: '80vh',
        maxHeight: '700px'
      }}
    >
      {/* Close button floating over iframe */}
      <button 
        onClick={closeChat}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center"
        aria-label="Close chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Chatbot iframe taking the full height */}
      <div className="w-full h-full">
        <iframe
          src={chatbotUrl}
          title="Elegance AI Assistant"
          className="w-full h-full border-0"
          allow="microphone"
        ></iframe>
      </div>
    </div>
  );
};

export default ChatbotFrame;