import React from 'react';

const StarsBackground = () => {
  return (
    <div className="stars-container">
      {/* Warm abstract shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-astro-tan/30 blur-[100px] animate-nebula" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[350px] h-[350px] rounded-full bg-astro-accent/20 blur-[90px] animate-nebula" style={{ animationDelay: '-7s' }} />
      <div className="absolute top-[40%] left-[50%] w-[200px] h-[200px] rounded-full bg-astro-cream-dark/50 blur-[60px] animate-float" />
    </div>
  );
};

export default StarsBackground;
