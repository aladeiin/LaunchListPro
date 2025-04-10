import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Blue gradient background circle */}
      <circle cx="256" cy="256" r="256" fill="url(#blue-gradient)" />
      
      {/* Inner ring elements */}
      <path d="M256 102C168.3 102 97 173.3 97 261C97 348.7 168.3 420 256 420C343.7 420 415 348.7 415 261C415 173.3 343.7 102 256 102ZM256 390C184.5 390 127 332.5 127 261C127 189.5 184.5 132 256 132C327.5 132 385 189.5 385 261C385 332.5 327.5 390 256 390Z" fill="#063A77" />
      
      {/* Green gradient arc */}
      <path d="M256 132C327.5 132 385 189.5 385 261C385 332.5 327.5 390 256 390" stroke="url(#green-gradient)" strokeWidth="30" strokeLinecap="round" />
      
      {/* Blue gradient arc */}
      <path d="M127 261C127 189.5 184.5 132 256 132" stroke="url(#blue-arc-gradient)" strokeWidth="30" strokeLinecap="round" />
      
      {/* White cross in center */}
      <path d="M256 201V321" stroke="white" strokeWidth="30" strokeLinecap="round" />
      <path d="M196 261H316" stroke="white" strokeWidth="30" strokeLinecap="round" />
      
      {/* Gradients definitions */}
      <defs>
        <linearGradient id="blue-gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0A4D9B" />
          <stop offset="1" stopColor="#063A77" />
        </linearGradient>
        
        <linearGradient id="green-gradient" x1="256" y1="132" x2="256" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7DE87D" />
          <stop offset="1" stopColor="#00A963" />
        </linearGradient>
        
        <linearGradient id="blue-arc-gradient" x1="127" y1="261" x2="256" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#05A0C8" />
          <stop offset="1" stopColor="#0288D1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;