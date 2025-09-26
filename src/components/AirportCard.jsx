import React, { useEffect, useRef, useState } from 'react'; // Import useState
import Input from "./Input/Index"; // Ensure this path is correct
import NASDetails from "./NASDetails";

/**
 * Component to display weather and NAS information. Includes D-ATIS, METAR, TAF and NAS Status.
 * @param {Object} props
 * @param {Object} props.weatherDetails - Weather data object
 * @param {Object} props.nasResponseAirport - NAS data for the airport
 * @param {boolean} props.showSearchBar - Whether to show the search bar (default: true)
 */
const AirportCard = ({ weatherDetails, nasResponseAirport, showSearchBar = true }) => {
    // --- START OF CHANGES ---

    // 1. State to manage which button is visually active: 'DEP' or 'ARR'
    const [selectedDatisType, setSelectedDatisType] = useState('DEP'); 

    // 2. All mock data and data-switching logic has been removed.
    //    'datis' is now sourced directly from props without modification.
    const datis = weatherDetails?.datis;

    // --- END OF CHANGES ---

    const metar = weatherDetails?.metar;
    const taf = weatherDetails?.taf;
    const searchContainerRef = useRef(null);

    const calculateMinutesAgoHHMMZ = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return null;
        
        const cleanTime = timeString.replace('Z', '').trim();
        if (cleanTime.length !== 4 || !/^\d{4}$/.test(cleanTime)) return null;
        
        const hours = parseInt(cleanTime.substring(0, 2), 10);
        const minutes = parseInt(cleanTime.substring(2, 4), 10);
        
        if (hours > 23 || minutes > 59) return null;
        
        const now = new Date();
        const currentUTCHours = now.getUTCHours();
        const currentUTCMinutes = now.getUTCMinutes();
        
        const currentTotalMinutes = currentUTCHours * 60 + currentUTCMinutes;
        const dataTotalMinutes = hours * 60 + minutes;
        
        let diffMinutes = currentTotalMinutes - dataTotalMinutes;
        
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60;
        }
        
        if (diffMinutes > 12 * 60) {
            diffMinutes = Math.abs(dataTotalMinutes - currentTotalMinutes);
        }
        
        return diffMinutes;
    };

    const calculateMinutesAgoDDHHMMZ = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return null;
        
        const cleanTime = timeString.replace('Z', '').trim();
        if (cleanTime.length !== 6 || !/^\d{6}$/.test(cleanTime)) return null;
        
        const day = parseInt(cleanTime.substring(0, 2), 10);
        const hours = parseInt(cleanTime.substring(2, 4), 10);
        const minutes = parseInt(cleanTime.substring(4, 6), 10);
        
        if (day < 1 || day > 31 || hours > 23 || minutes > 59) return null;
        
        const now = new Date();
        const currentUTCDay = now.getUTCDate();
        const currentUTCHours = now.getUTCHours();
        const currentUTCMinutes = now.getUTCMinutes();
        const currentMonth = now.getUTCMonth();
        const currentYear = now.getUTCFullYear();
        
        let dataTime = new Date(Date.UTC(currentYear, currentMonth, day, hours, minutes, 0, 0));
        let currentTime = new Date(Date.UTC(currentYear, currentMonth, currentUTCDay, currentUTCHours, currentUTCMinutes, 0, 0));
        
        let diffMs = currentTime.getTime() - dataTime.getTime();
        
        if (diffMs < 0) {
            dataTime = new Date(Date.UTC(currentYear, currentMonth - 1, day, hours, minutes, 0, 0));
            diffMs = currentTime.getTime() - dataTime.getTime();
        }
        
        if (diffMs < 0 || diffMs > (35 * 24 * 60 * 60 * 1000)) {
            dataTime = new Date(Date.UTC(currentYear, currentMonth + 1, day, hours, minutes, 0, 0));
            diffMs = currentTime.getTime() - dataTime.getTime();
            
            if (diffMs < 0) {
                diffMs = Math.abs(diffMs);
            }
        }
        
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        
        return diffMinutes;
    };

    const formatMinutesAgo = (minutes) => {
        if (minutes === null || minutes === undefined) return 'N/A';
        return `${minutes} mins ago`;
    };

    const getTimestampColor = (minutesAgo, dataType) => {
        if (minutesAgo === null || minutesAgo === undefined) return '#6b7280';
        
        if (dataType === 'datis' || dataType === 'metar') {
            if (minutesAgo < 10) return '#22c55e';
            else if (minutesAgo > 55) return '#ef4444';
            else return '#6b7280';
        } else if (dataType === 'taf') {
            if (minutesAgo < 10) return '#22c55e';
            else if (minutesAgo > 350) return '#ef4444';
            else return '#6b7280';
        }
        
        return '#6b7280';
    };

    const getNASTitle = () => {
        return "NAS Status";
    };

    const datisMinutesAgo = weatherDetails?.datis_ts ? calculateMinutesAgoHHMMZ(weatherDetails.datis_ts) : null;
    const metarMinutesAgo = weatherDetails?.metar_ts ? calculateMinutesAgoDDHHMMZ(weatherDetails.metar_ts) : null;
    const tafMinutesAgo = weatherDetails?.taf_ts ? calculateMinutesAgoDDHHMMZ(weatherDetails.taf_ts) : null;

    useEffect(() => {
        if (showSearchBar && searchContainerRef.current) {
            searchContainerRef.current.style.cssText = 'margin-top: -70px !important; margin-bottom: -40px;';
            const parentElement = searchContainerRef.current.parentElement;
            if (parentElement && parentElement.classList.contains('weather-container')) {
                parentElement.style.paddingTop = '0';
            }
        }
    }, [showSearchBar]);

    return (
        <div className="weather-container">
            {showSearchBar && (
                <div className="combined-search" ref={searchContainerRef}>
                    <Input userEmail="user@example.com" isLoggedIn={true} />
                </div>
            )}

            <NASDetails nasResponse={nasResponseAirport} title={getNASTitle(nasResponseAirport)} />

            <div className="weather-cards">
                {/* D-ATIS Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">D-ATIS</h2>
                        {/* The buttons are here for UI purposes. Clicking them updates their style. */}
                        <div className="datis-toggle">
                            <button
                                className={`toggle-btn ${selectedDatisType === 'DEP' ? 'active' : ''}`}
                                onClick={() => setSelectedDatisType('DEP')}
                            >
                                DEP
                            </button>
                            <button
                                className={`toggle-btn ${selectedDatisType === 'ARR' ? 'active' : ''}`}
                                onClick={() => setSelectedDatisType('ARR')}
                            >
                                ARR
                            </button>
                        </div>
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(datisMinutesAgo, 'datis'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {formatMinutesAgo(datisMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            {/* This now displays the original 'datis' prop, regardless of which button is active */}
                            <p 
                                style={{ lineHeight: '1.87083' }}
                                dangerouslySetInnerHTML={{ __html: datis }}
                            ></p>
                        </div>
                    </div>
                </div>

                {/* METAR Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">METAR</h2>
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(metarMinutesAgo, 'metar'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {formatMinutesAgo(metarMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            <p 
                                style={{ lineHeight: '1.87083' }}
                                dangerouslySetInnerHTML={{ __html: metar }}
                            ></p>
                        </div>
                    </div>
                </div>

                {/* TAF Card */}
                <div className="weather-card">
                    <div className="card-header">
                        <h2 className="header-title">TAF</h2>
                        <span 
                            className="timestamp" 
                            style={{ 
                                color: getTimestampColor(tafMinutesAgo, 'taf'), 
                                fontWeight: 'normal' 
                            }}
                        >
                            {formatMinutesAgo(tafMinutesAgo)}
                        </span>
                    </div>
                    <div className="card-body">
                        <div className="data-content">
                            <p 
                                style={{ lineHeight: '1.87083' }}
                                dangerouslySetInnerHTML={{ __html: taf }}
                            ></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirportCard;