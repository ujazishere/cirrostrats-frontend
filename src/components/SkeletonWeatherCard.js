// src/components/SkeletonWeatherCard.js
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonWeatherCard = () => {
  return (
    <div className="card">
      {['D-ATIS', 'METAR', 'TAF'].map((section, index) => (
        <div key={index}>
          <div className="card__depature__subtitle card__header--dark">
            <Skeleton width={120} height={24} />
            <Skeleton width={120} height={24} />
          </div>
          <div className="card__depature__details">
            <Skeleton count={2} height={16} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonWeatherCard;