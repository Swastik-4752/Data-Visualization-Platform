"use client";

import React from 'react';
import './AnalyzingLoader.css';

export default function AnalyzingLoader() {
  const letters = ['A', 'n', 'a', 'l', 'y', 'z', 'i', 'n', 'g'];

  return (
    <div className="analyzing-loader-wrapper">
      {letters.map((letter, index) => (
        <span 
          key={index} 
          className="analyzing-loader-letter"
          style={{
            animationDelay: `${0.1 + index * 0.105}s`
          }}
        >
          {letter}
        </span>
      ))}
      <div className="analyzing-loader" />
    </div>
  );
}

