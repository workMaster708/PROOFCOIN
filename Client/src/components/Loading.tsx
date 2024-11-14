import React from 'react';
import '../styles/Loading.css';

const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-background">
        <p><div className="loader"></div></p>
      </div>
    </div>
  );
};

export default Loading;
