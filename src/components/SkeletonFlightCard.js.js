// src/components/SkeletonFlightCard.js
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonFlightCard = () => {
  return (
    <div className="details">
      <div className="details__card">
        <Skeleton height={32} width={256} />

        <div className="detail__body">
          {/* Departure Loading State */}
          <div className="detail__depature">
            <Skeleton height={24} width={160} />
            <div className="detail__gate">
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={80} />
            </div>
            <div className="detail__depature__time">
              <Skeleton height={24} width={96} />
              <Skeleton height={24} width={96} />
            </div>
            <div className="detail__depature__utc__time">
              <Skeleton height={24} width={96} />
              <Skeleton height={24} width={96} />
            </div>
          </div>

          {/* Arrival Loading State */}
          <div className="detail__arrival">
            <Skeleton height={24} width={160} />
            <div className="detail__gate">
              <Skeleton height={24} width={80} />
              <Skeleton height={24} width={80} />
            </div>
            <div className="detail__arrival__time">
              <Skeleton height={24} width={96} />
              <Skeleton height={24} width={96} />
            </div>
            <div className="detail__arrival__utc__time">
              <Skeleton height={24} width={96} />
              <Skeleton height={24} width={96} />
            </div>
          </div>
        </div>
      </div>

      {/* Departure Weather Loading State */}
      <div className="table-container">
        <table className="flight_card" style={{ width: '100%' }}>
          <tbody>
            <SkeletonWeatherCard />
          </tbody>
        </table>
      </div>

      {/* Route Loading State */}
      <table className="route">
        <tbody>
          <tr>
            <th>ROUTE</th>
          </tr>
          <tr>
            <td>
              <Skeleton height={16} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* NAS Details Loading State */}
      <div className="nas-details">
        <Skeleton height={24} width={256} />
        <Skeleton height={16} />
      </div>

      {/* Destination Weather Loading State */}
      <div className="table-container">
        <table className="flight_card" style={{ width: '100%' }}>
          <tbody>
            <SkeletonWeatherCard />
          </tbody>
        </table>
      </div>

      {/* NAS Details Destination Loading State */}
      <div className="nas-details">
        <Skeleton height={24} width={256} />
        <Skeleton height={16} />
      </div>
    </div>
  );
};

export default SkeletonFlightCard;