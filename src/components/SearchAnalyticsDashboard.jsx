import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, TrendingUp, Search } from 'lucide-react';
import axios from 'axios';
import '../components/CSS/SearchAnalyticsDashboard.css';

const SearchAnalyticsDashboard = () => {
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('line');
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  // Get API URL from environment variables with fallback
  const apiUrl = import.meta.env.VITE_API_URL || 'https://beta.cirrostrats.us/api';

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        // Using axios with additional configuration for CORS
        const response = await axios.get(`${apiUrl}/searches/all`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000, // 10 second timeout
          withCredentials: false // Explicitly set to false for cross-origin requests
        });

        const processedData = processSearchData(response.data);
        setSearchData(processedData);
        setError(null);
      } catch (err) {
        // More detailed error handling
        let errorMessage = 'Failed to fetch search data';
        
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out';
        } else if (err.response) {
          // Server responded with error status
          errorMessage = `Server error: ${err.response.status}`;
        } else if (err.request) {
          // Request was made but no response (likely CORS or network issue)
          errorMessage = 'Network error - check CORS configuration';
        }

        // We only set an error message if the initial fetch fails
        if (loading) {
          setError(errorMessage);
          // Use mock data as fallback
          setSearchData(generateMockData());
        }
        console.error('Error fetching search data:', err);
      } finally {
        // This ensures the loading spinner only shows on the initial load
        if (loading) {
          setLoading(false);
        }
      }
    };

    // 1. Fetch data immediately when the component loads
    fetchSearchData();

    // 2. Then, set an interval to fetch data every 30 seconds (30000 milliseconds)
    const intervalId = setInterval(fetchSearchData, 30000);

    // 3. The cleanup function clears the interval when the component is removed
    return () => clearInterval(intervalId);
  }, [loading, apiUrl]); // Added apiUrl to dependency array

  // Process raw search data into time-series format
  const processSearchData = (rawData) => {
    const timeSeriesData = {};
    if (!Array.isArray(rawData)) {
      console.error("Expected rawData to be an array, but got:", typeof rawData);
      return [];
    }

    rawData.forEach(item => {
      const searchTerm = Object.keys(item)[0];
      const timestamps = Object.values(item)[0];
      if (Array.isArray(timestamps)) {
        timestamps.forEach(timestamp => {
          const date = new Date(timestamp);
          const timeKey = getTimeKey(date, 'hour');
          if (!timeSeriesData[timeKey]) {
            timeSeriesData[timeKey] = {
              time: timeKey,
              timestamp: date.getTime(),
              searches: 0,
              searchTerms: new Set()
            };
          }
          timeSeriesData[timeKey].searches += 1;
          timeSeriesData[timeKey].searchTerms.add(searchTerm);
        });
      }
    });

    return Object.values(timeSeriesData)
      .map(item => ({
        ...item,
        uniqueTerms: item.searchTerms.size,
        searchTerms: Array.from(item.searchTerms)
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // Generate mock data in case of initial fetch failure
  const generateMockData = () => {
    const data = [];
    const now = new Date();
    for (let i = 168; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toISOString(),
        timestamp: time.getTime(),
        searches: Math.floor(Math.random() * 50) + 5,
        uniqueTerms: Math.floor(Math.random() * 20) + 2,
        searchTerms: ['flight123', 'airport_code', 'weather_data', 'booking_info']
      });
    }
    return data;
  };

  const getTimeKey = (date, granularity) => {
    switch (granularity) {
      case 'minute': return date.toISOString().slice(0, 16);
      case 'hour': return date.toISOString().slice(0, 13);
      case 'day': return date.toISOString().slice(0, 10);
      case 'month': return date.toISOString().slice(0, 7);
      default: return date.toISOString().slice(0, 13);
    }
  };

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!searchData.length) return [];
    const now = new Date();
    let cutoffTime;
    switch (timeRange) {
      case '1h': cutoffTime = now.getTime() - (60 * 60 * 1000); break;
      case '6h': cutoffTime = now.getTime() - (6 * 60 * 60 * 1000); break;
      case '1d': cutoffTime = now.getTime() - (24 * 60 * 60 * 1000); break;
      case '7d': cutoffTime = now.getTime() - (7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoffTime = now.getTime() - (30 * 24 * 60 * 60 * 1000); break;
      default: cutoffTime = 0;
    }
    return searchData.filter(item => item.timestamp >= cutoffTime);
  }, [searchData, timeRange]);

  // Format timestamp for display
  const formatLabel = (timestamp) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1h':
      case '6h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '1d':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Load Chart.js dynamically
  useEffect(() => {
    if (window.Chart) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => console.log('Chart.js loaded');
    script.onerror = () => console.error('Failed to load Chart.js');
  }, []);

  // Create or update chart
  useEffect(() => {
    if (!filteredData.length || typeof window.Chart === 'undefined' || !canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    const chartData = {
      labels: filteredData.map(item => formatLabel(item.timestamp)),
      datasets: [
        {
          label: 'Total Searches',
          data: filteredData.map(item => item.searches),
          borderColor: '#3b82f6',
          backgroundColor: chartType === 'bar' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.4
        },
        {
          label: 'Unique Terms',
          data: filteredData.map(item => item.uniqueTerms),
          borderColor: '#10b981',
          backgroundColor: chartType === 'bar' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.4
        }
      ]
    };

    const config = {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { display: true, title: { display: true, text: 'Time' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
          y: { display: true, title: { display: true, text: 'Count' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (context) => new Date(filteredData[context[0].dataIndex].timestamp).toLocaleString(),
              afterBody: (context) => {
                const data = filteredData[context[0].dataIndex];
                if (data.searchTerms && data.searchTerms.length > 0) {
                  return ['', 'Popular searches:', ...data.searchTerms.slice(0, 3)];
                }
                return [];
              }
            }
          },
          legend: { display: true, position: 'top' }
        }
      }
    };

    chartInstance.current = new window.Chart(ctx, config);
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [filteredData, chartType, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredData.length) return { total: 0, average: 0, peak: 0 };
    const total = filteredData.reduce((sum, item) => sum + item.searches, 0);
    const average = Math.round(total / filteredData.length);
    const peak = Math.max(...filteredData.map(item => item.searches));
    return { total, average, peak };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading search analytics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <div className="container">
        <header className="dashboard-header">
          <h1>Search Analytics Dashboard</h1>
          <p>Monitor search patterns and trends over time</p>
        </header>

        {error && (
          <div className="error-message">
            <p>{error} - Showing mock data for demonstration</p>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <Search className="stat-icon-blue" />
            <div className="stat-info">
              <p className="stat-title">Total Searches</p>
              <p className="stat-value">{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp className="stat-icon-green" />
            <div className="stat-info">
              <p className="stat-title">Average per Period</p>
              <p className="stat-value">{stats.average}</p>
            </div>
          </div>
          <div className="stat-card">
            <Calendar className="stat-icon-purple" />
            <div className="stat-info">
              <p className="stat-title">Peak Searches</p>
              <p className="stat-value">{stats.peak}</p>
            </div>
          </div>
        </div>

        <div className="card controls-container">
          <div className="control-group">
            <label>Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="control-group">
            <label>Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>

          <p className="data-points-info">
            {filteredData.length} data points
          </p>
        </div>

        <div className="card">
          <h2>Search Volume Over Time</h2>
          <div className="chart-wrapper">
            <canvas ref={canvasRef} />
          </div>
          <div className="chart-instructions">
            <h3>Chart Features:</h3>
            <ul>
              <li>• Hover over data points to see detailed information</li>
              <li>• Use the time range selector to zoom in/out on different periods</li>
              <li>• Switch between line and bar chart views</li>
              <li>• Blue line shows total searches, green line shows unique search terms</li>
            </ul>
          </div>
        </div>

        <div className="card table-container">
          <h2>Recent Search Activity</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Total Searches</th>
                  <th>Unique Terms</th>
                  <th>Top Search Terms</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(-10).reverse().map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td><span className="badge badge-blue">{item.searches}</span></td>
                    <td><span className="badge badge-green">{item.uniqueTerms}</span></td>
                    <td>
                      <div className="tag-group">
                        {item.searchTerms.slice(0, 3).map((term, termIndex) => (
                          <span key={termIndex} className="tag">{term}</span>
                        ))}
                        {item.searchTerms.length > 3 && (
                          <span className="tag-more">
                            +{item.searchTerms.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalyticsDashboard;