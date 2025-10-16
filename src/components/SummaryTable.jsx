// SummaryTable.js

import React, { useState, useEffect } from 'react';

// Component accepts the new isLoadingEdct prop
const SummaryTable = ({ flightData, EDCT, isLoadingEdct }) => {
  // Helper functions (hasValue, getPairDisplayValue, etc.) remain unchanged
  const hasValue = (value) => value !== null && value !== undefined && value.toString().trim() !== '' && value !== 'N/A';
  const hasPairValue = (value1, value2) => hasValue(value1) || hasValue(value2);
  const getPairDisplayValue = (value) => hasValue(value) ? value : '—';
  
  // getCountdown and EDCTRow components remain unchanged...
  const getCountdown = (edctTime) => {
    if (!hasValue(edctTime)) return '—';
    try {
      const [datePart, timePart] = edctTime.split(' ');
      const [month, day, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      const edctDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));
      const now = new Date();
      const timeDiff = edctDate.getTime() - now.getTime();
      const totalMinutes = Math.floor(Math.abs(timeDiff) / (1000 * 60));
      const days = Math.floor(totalMinutes / (24 * 60));
      const hrs = Math.floor((totalMinutes % (24 * 60)) / 60);
      const mins = totalMinutes % 60;
      const isExpired = timeDiff <= 0;
      const prefix = isExpired ? '-' : '';
      if (days > 0) return `${prefix}${days}d ${hrs}h ${mins}m`;
      if (hrs > 0) return `${prefix}${hrs}h ${mins}m`;
      return `${prefix}${mins}m`;
    } catch (error) { return edctTime; }
  };
  
  const EDCTRow = ({ edctItem }) => {
    const [countdown, setCountdown] = useState(() => getCountdown(edctItem.edct));
    useEffect(() => {
      const intervalId = setInterval(() => setCountdown(getCountdown(edctItem.edct)), 60000);
      return () => clearInterval(intervalId);
    }, [edctItem.edct]);
    return (
      <div className="edct-row">
        <div className="edct-cell" data-label="Filed Departure Time">{hasValue(edctItem.filedDepartureTime) ? edctItem.filedDepartureTime : '—'}Z</div>
        <div className="edct-cell" data-label="EDCT">{edctItem.edct}Z</div>
        <div className="edct-cell" data-label="T-minus">{countdown}</div>
        <div className="edct-cell" data-label="Control Element">{hasValue(edctItem.controlElement) ? edctItem.controlElement : '—'}</div>
        <div className="edct-cell" data-label="Flight Cancelled">{hasValue(edctItem.flightCancelled) ? edctItem.flightCancelled.toString() : '—'}</div>
      </div>
    );
  };
  // EDCTSection is updated to handle the loading state
  const EDCTSection = ({ edctData }) => {
    // Show a loading state while EDCT data is being fetched
    if (isLoadingEdct) {
      return (
        <div className="edct-section">
          <h3 className="edct-title" style={{ color: '#d0925e' }}>EDCT</h3>
          <div style={{ padding: '10px 15px', color: '#6c757d', fontSize: '0.9em' }}>
            Loading EDCT...
          </div>
        </div>
      );
    }
    
    // Original logic for hiding or showing data
    if (!edctData || !Array.isArray(edctData) || edctData.length === 0) {
      return null;
    }
    
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div className="edct-section">
        <div onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }} className="edct-collapsible-header">
          <h3 className="edct-title" style={{ color: '#d0925e' }}>EDCT<span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#d0925e' }}>{isExpanded ? '▼' : '▶'}</span></h3>
        </div>
        {isExpanded && (
          <div className="edct-table">
            <div className="edct-row edct-header">
              <div className="edct-cell">Filed Departure Time</div>
              <div className="edct-cell">EDCT</div>
              <div className="edct-cell">Control Element</div>
              <div className="edct-cell">Flight Cancelled</div>
            </div>
            {edctData.map((item, index) => <EDCTRow key={index} edctItem={item} />)}
          </div>
        )}
      </div>
    );
  };
  
  // Functions like formatTimeWithTimezone, extractTimezone, calculateDelayMinutes, getDepartureDisplayInfo remain unchanged...
  const formatTimeWithTimezone = (timeString) => hasValue(timeString) ? timeString : '—';
  const extractTimezone = (timeString) => { if (!hasValue(timeString)) return ''; const parts = timeString.trim().split(' '); return parts.length >= 3 ? parts[parts.length - 1] : ''; };
  const calculateDelayMinutes = (scheduledTime, comparisonTime) => { try { const parseTime = (timeStr) => { const timePart = timeStr.split(' ').slice(0, 2).join(' '); const [time, period] = timePart.split(' '); const [hours, minutes] = time.split(':').map(Number); let hour24 = hours; if (period === 'PM' && hours !== 12) hour24 = hours + 12; if (period === 'AM' && hours === 12) hour24 = 0; return hour24 * 60 + minutes; }; const scheduledMinutes = parseTime(scheduledTime); const comparisonMinutes = parseTime(comparisonTime); return comparisonMinutes - scheduledMinutes; } catch (e) { return 0; } };
  const getDepartureDisplayInfo = (flightData) => { const scheduledTime = flightData?.flightStatsScheduledDepartureTime; const actualTime = flightData?.flightStatsActualDepartureTime; const estimatedTime = flightData?.flightStatsEstimatedDepartureTime; const formatDelay = (totalMinutes) => { if (totalMinutes < 60) return `${totalMinutes} mins`; const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; const hoursText = `${hours}h`; const minutesText = minutes > 0 ? ` ${minutes}m` : ''; return `${hoursText}${minutesText}`; }; const defaultState = { isDelayed: false, badgeText: null, departureLabel: 'Scheduled Local', departureTime: formatTimeWithTimezone(scheduledTime), departureTimeClass: '', showStrikethrough: false, scheduledDepartureTimeForDisplay: null }; if (!hasValue(scheduledTime)) return defaultState; const comparisonTime = hasValue(actualTime) ? actualTime : (hasValue(estimatedTime) ? estimatedTime : null); if (!comparisonTime) return defaultState; try { const diffMinutes = calculateDelayMinutes(scheduledTime, comparisonTime); const formattedScheduledTime = formatTimeWithTimezone(scheduledTime); const formattedComparisonTime = formatTimeWithTimezone(comparisonTime); if (hasValue(actualTime)) { if (diffMinutes > 0) return { isDelayed: true, badgeText: `Departed ${formatDelay(diffMinutes)} Late`, departureLabel: 'DEPARTED', departureTime: formattedComparisonTime, departureTimeClass: 'time-delayed', showStrikethrough: true, scheduledDepartureTimeForDisplay: formattedScheduledTime }; return { isDelayed: false, badgeText: null, departureLabel: 'DEPARTED', departureTime: formattedComparisonTime, departureTimeClass: 'time-on-time', showStrikethrough: true, scheduledDepartureTimeForDisplay: formattedScheduledTime }; } else if (hasValue(estimatedTime)) { if (diffMinutes > 0) return { isDelayed: true, badgeText: `Delayed by ${formatDelay(diffMinutes)}`, departureLabel: 'Now @', departureTime: formattedComparisonTime, departureTimeClass: 'time-delayed', showStrikethrough: true, scheduledDepartureTimeForDisplay: formattedScheduledTime }; } return defaultState; } catch (error) { console.error("Error calculating flight departure status:", error); return defaultState; } };
  const departureInfo = getDepartureDisplayInfo(flightData);

  // Main return JSX
  return (
    <>
      <div className="flight-info-container">
        <div className="flight-header-section">
          {hasValue(flightData?.flightID) && <div className="flight-header-item"><span className="flight-header-label">Flight</span><h2 className="flight-number-text">{flightData.flightID}</h2></div>}
          {hasValue(flightData?.registration) && <div className="flight-header-item"><span className="flight-header-label">Tail Number</span><span className="aircraft-number">{flightData.registration}</span></div>}
          {hasValue(flightData?.aircraftType) && <div className="flight-header-item"><span className="flight-header-label">Aircraft</span><span className="aircraft-type">{flightData.aircraftType}</span></div>}
        </div>

        <EDCTSection edctData={EDCT} />

        {departureInfo.isDelayed && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <span style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', padding: '5px 15px', borderRadius: '16px', fontSize: '0.9em', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {departureInfo.badgeText}
            </span>
          </div>
        )}

        {hasPairValue(flightData?.departure, flightData?.arrival) && (
          <div className="airport-codes-section">
            <div className="airport-code-large">{getPairDisplayValue(flightData?.departure)}</div>
            <div className="arrow-icon">→</div>
            <div className="airport-code-large">{getPairDisplayValue(flightData?.arrival)}</div>
          </div>
        )}

        <div className="flight-details-grid">
          <div className="departure-details">
            {hasPairValue(flightData?.flightStatsOriginGate, flightData?.flightStatsDestinationGate) && <div className="info-item"><div className="info-label">Gate</div><div className="info-value">{getPairDisplayValue(flightData?.flightStatsOriginGate)}</div></div>}
            {hasPairValue(flightData?.flightStatsScheduledDepartureTime, flightData?.flightStatsScheduledArrivalTime) && (
              <div className="info-item">
                <div className="info-label">{departureInfo.departureLabel}</div>
                {departureInfo.showStrikethrough ? (
                  <div>
                    <div className={`time-value ${departureInfo.departureTimeClass}`} style={{ fontWeight: 'bold' }}>{departureInfo.departureTime}</div>
                    <div style={{ fontSize: '0.8em', textDecoration: 'line-through', opacity: 0.7 }}>{departureInfo.scheduledDepartureTimeForDisplay}</div>
                  </div>
                ) : (
                  <div className="time-value">{departureInfo.departureTime}</div>
                )}
              </div>
            )}
          </div>
          <div className="arrival-details">
            {hasPairValue(flightData?.flightStatsOriginGate, flightData?.flightStatsDestinationGate) && <div className="info-item"><div className="info-label">Gate</div><div className="info-value">{getPairDisplayValue(flightData?.flightStatsDestinationGate)}</div></div>}
            {hasPairValue(flightData?.flightStatsScheduledDepartureTime, flightData?.flightStatsScheduledArrivalTime) && <div className="info-item"><div className="info-label">Scheduled Local</div><div className="time-value">{getPairDisplayValue(flightData?.flightStatsScheduledArrivalTime)}</div></div>}
          </div>
        </div>

        <div className="scheduled-estimated-grid">
          <div className="departure-out-times">
            {hasPairValue(flightData?.flightAwareScheduledOut, flightData?.flightAwareScheduledIn) && <div className="info-item"><div className="info-label">Scheduled Out</div><div className="info-value">{getPairDisplayValue(flightData?.flightAwareScheduledOut)}</div></div>}
            {hasPairValue(flightData?.fa_estimated_out, flightData?.fa_estimated_in) && <div className="info-item"><div className="info-label">Estimated Out</div><div className="info-value">{getPairDisplayValue(flightData?.fa_estimated_out)}</div></div>}
          </div>
          <div className="arrival-in-times">
            {hasPairValue(flightData?.flightAwareScheduledOut, flightData?.flightAwareScheduledIn) && <div className="info-item"><div className="info-label">Scheduled In</div><div className="info-value">{getPairDisplayValue(flightData?.flightAwareScheduledIn)}</div></div>}
            {hasPairValue(flightData?.fa_estimated_out, flightData?.fa_estimated_in) && <div className="info-item"><div className="info-label">Estimated In</div><div className="info-value">{getPairDisplayValue(flightData?.fa_estimated_in)}</div></div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryTable;