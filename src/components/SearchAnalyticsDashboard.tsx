import { useState, useEffect, useMemo, useRef } from "react";
import { Calendar, TrendingUp, Search } from "lucide-react";
import axios from "axios";
import "../components/CSS/SearchAnalyticsDashboard.css";

// Get API URL from environment variables with fallback
const apiUrl =
  import.meta.env.VITE_API_URL || "https://beta.cirrostrats.us/api";

interface TimeSeriesDataPoint {
  time: string;
  timestamp: number;
  searches: number;
  uniqueTerms: number;
  searchTerms: string[];
}

interface RawSearchDataPoint {
  searchTerm: string;
  timestamp: number;
  formattedTime: string;
}

interface SearchDataStructure {
  timeSeriesData: TimeSeriesDataPoint[];
  rawSearchData: RawSearchDataPoint[];
}

interface RawTimelineItem {
  timestamp: string;
  _id?: string;
  [key: string]: any;
}

// === Helper: robustly parse any incoming timestamp and treat it AS UTC ===
// Accepts Date / numeric ms / various ISO-like strings (with/without Z, microseconds, offsets).
const parseTimestampToUTC = (input: any): Date | null => {
  if (input == null) return null;
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);

  let s = String(input).trim();

  // If there's a timezone offset or trailing Z, we will keep it.
  const hasTZ = /[Zz]|[+-]\d{2}:\d{2}$/.test(s);

  // Truncate any fractional seconds beyond milliseconds (more than 3 digits)
  s = s.replace(/(\.\d{3})\d+/, "$1");

  // If fractional part has 1 or 2 digits, pad to 3 (milliseconds)
  s = s.replace(
    /\.(\d{1,2})(?=$|[Zz]|[+-]\d{2}:\d{2}$)/,
    (_m, p1) => "." + p1.padEnd(3, "0")
  );

  // If no timezone info present (no Z and no offset), treat as UTC by appending Z
  if (!hasTZ) {
    s = s + "Z";
  }

  const d = new Date(s);
  // Fallback: if parsing still fails, try Date constructor directly (best-effort)
  if (isNaN(d.getTime())) {
    return new Date(input);
  }
  return d;
};

// Helper function to format dates in GMT/Zulu
const formatGMTDate = (
  dateInput: any,
  format: "full" | "table" | "day" = "full"
): string => {
  const d = parseTimestampToUTC(dateInput);
  if (!d) return "";

  if (format === "table") {
    // Wed 24 1338Z format for table
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[d.getUTCDay()];
    const day = d.getUTCDate();
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    return `${dayName} ${day} ${hours}${minutes}Z`;
  }

  if (format === "day") {
    // For chart labels - day only (YYYY-MM-DD)
    // Use toISOString which is always UTC
    return d.toISOString().split("T")[0];
  }

  return d.toISOString();
};

// Format chart labels to show only day without repetition
const formatChartLabel = (dateString: string): string => {
  // dateString may be 'YYYY-MM-DD' (day key) or an ISO string; ensure we parse as UTC day
  const isoDay =
    dateString && !dateString.includes("T")
      ? `${dateString}T00:00:00Z`
      : dateString;
  const date = parseTimestampToUTC(isoDay);
  if (!date) return "";
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${month}/${day}`;
};

// Generate mock data in case of initial fetch failure
const generateMockData = (): SearchDataStructure => {
  const timeSeriesData: TimeSeriesDataPoint[] = [];
  const rawSearchData: RawSearchDataPoint[] = [];
  const now = new Date();
  const mockTerms = [
    "flight123",
    "airport_code",
    "weather_data",
    "booking_info",
    "GJS4414",
    "GJS4409",
    "C105",
  ];

  // Generate time series data (daily aggregated)
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayKey = formatGMTDate(time, "day");
    const startOfDay = new Date(dayKey + "T00:00:00.000Z");
    const searches = Math.floor(Math.random() * 50) + 5;

    timeSeriesData.push({
      time: dayKey,
      timestamp: startOfDay.getTime(), // Use start of day timestamp
      searches: searches,
      uniqueTerms: Math.floor(Math.random() * 20) + 2,
      searchTerms: mockTerms.slice(0, Math.floor(Math.random() * 4) + 1),
    });
  }

  // Generate individual search records for table
  for (let i = 0; i < 100; i++) {
    const randomHours = Math.floor(Math.random() * 7 * 24); // Last 7 days
    const time = new Date(now.getTime() - randomHours * 60 * 60 * 1000);
    const term = mockTerms[Math.floor(Math.random() * mockTerms.length)];

    rawSearchData.push({
      searchTerm: term,
      timestamp: time.getTime(),
      formattedTime: formatGMTDate(time, "table"),
    });
  }

  rawSearchData.sort((a, b) => b.timestamp - a.timestamp);

  return { timeSeriesData, rawSearchData };
};

// Process raw search data from timeline API format
const processSearchData = (rawData: RawTimelineItem[]): SearchDataStructure => {
  console.log("Processing timeline data:", rawData);
  const timeSeriesData: { [key: string]: any } = {};
  const rawSearchData: RawSearchDataPoint[] = []; // For table display

  if (!Array.isArray(rawData)) {
    console.error("Expected rawData to be an array, but got:", typeof rawData);
    return {
      timeSeriesData: generateMockData().timeSeriesData,
      rawSearchData: generateMockData().rawSearchData,
    };
  }

  // Process the actual timeline API format: [{ field_name: "value", timestamp: "2025-08-06T21:32:38.072000" }]
  rawData.forEach(item => {
    if (!item.timestamp) {
      console.warn("Item missing timestamp:", item);
      return;
    }

    // Extract search terms (everything except timestamp and _id)
    const searchTermKeys = Object.keys(item).filter(
      key => key !== "timestamp" && key !== "_id"
    );

    searchTermKeys.forEach(termKey => {
      const searchTerm = item[termKey];

      // Parse timestamp robustly and treat as UTC
      const date = parseTimestampToUTC(item.timestamp);

      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid timestamp:", item.timestamp);
        return;
      }

      // For chart data - group by day (UTC), use start of day as timestamp for proper filtering
      const dayKey = formatGMTDate(date, "day");
      const startOfDay = new Date(dayKey + "T00:00:00.000Z");

      if (!timeSeriesData[dayKey]) {
        timeSeriesData[dayKey] = {
          time: dayKey,
          timestamp: startOfDay.getTime(), // Use start of day for consistent filtering
          searches: 0,
          searchTerms: new Set(),
        };
      }

      timeSeriesData[dayKey].searches += 1;
      timeSeriesData[dayKey].searchTerms.add(searchTerm);

      // For table data - keep individual records
      rawSearchData.push({
        searchTerm: searchTerm,
        timestamp: date.getTime(),
        formattedTime: formatGMTDate(date, "table"),
      });
    });
  });

  const processedTimeSeriesData = Object.values(timeSeriesData)
    .map(item => ({
      ...item,
      uniqueTerms: item.searchTerms.size,
      searchTerms: Array.from(item.searchTerms),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Sort raw search data by timestamp descending (newest first)
  rawSearchData.sort((a, b) => b.timestamp - a.timestamp);

  console.log(
    "Processed timeline data points:",
    processedTimeSeriesData.length
  );
  const result = {
    timeSeriesData:
      processedTimeSeriesData.length > 0
        ? processedTimeSeriesData
        : generateMockData().timeSeriesData,
    rawSearchData:
      rawSearchData.length > 0
        ? rawSearchData
        : generateMockData().rawSearchData,
  };

  return result;
};

// @ts-expect-error - unused function
const _getTimeKey = (
  date: any,
  granularity: "minute" | "hour" | "day" | "month"
): string => {
  const gmtDate = parseTimestampToUTC(date);
  if (!gmtDate) return "";
  switch (granularity) {
    case "minute":
      return gmtDate.toISOString().slice(0, 16);
    case "hour":
      return gmtDate.toISOString().slice(0, 13);
    case "day":
      return gmtDate.toISOString().slice(0, 10);
    case "month":
      return gmtDate.toISOString().slice(0, 7);
    default:
      return gmtDate.toISOString().slice(0, 10);
  }
};

const SearchAnalyticsDashboard = () => {
  const [searchData, setSearchData] = useState<SearchDataStructure>({
    timeSeriesData: [],
    rawSearchData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [tableTimeRange, setTableTimeRange] = useState("7d");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        console.log(
          "Fetching from timeline endpoint:",
          `${apiUrl}/searches/timeline`
        );

        // Using axios with additional configuration for CORS
        const response = await axios.get(`${apiUrl}/searches/timeline`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // 10 second timeout
          withCredentials: false, // Explicitly set to false for cross-origin requests
        });

        console.log("Timeline API response:", response.data);
        const processedData = processSearchData(response.data);
        setSearchData(processedData);
        setError(null);
      } catch (err: any) {
        // More detailed error handling
        let errorMessage = "Failed to fetch search data";

        if (err.code === "ECONNABORTED") {
          errorMessage = "Request timed out";
        } else if (err.response) {
          // Server responded with error status
          errorMessage = `Server error: ${err.response.status}`;
        } else if (err.request) {
          // Request was made but no response (likely CORS or network issue)
          errorMessage = "Network error - check CORS configuration";
        }

        // We only set an error message if the initial fetch fails
        if (loading) {
          setError(errorMessage);
          // Use mock data as fallback
          setSearchData(generateMockData());
        }
        console.error("Error fetching search data:", err);
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
  }, [loading]); // Added apiUrl to dependency array

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!searchData.timeSeriesData || !searchData.timeSeriesData.length)
      return [];
    const now = Date.now();
    let cutoffTime;

    switch (timeRange) {
      case "1d":
        // For last 24 hours, include today and yesterday to ensure we show data
        cutoffTime = now - 2 * 24 * 60 * 60 * 1000;
        break;
      case "7d":
        cutoffTime = now - 8 * 24 * 60 * 60 * 1000; // Include one extra day
        break;
      case "30d":
        cutoffTime = now - 31 * 24 * 60 * 60 * 1000; // Include one extra day
        break;
      default:
        cutoffTime = 0;
    }

    const filtered = searchData.timeSeriesData.filter(
      item => item.timestamp >= cutoffTime
    );

    // For 24 hours, limit to last 2 days max to avoid showing too much historical data
    if (timeRange === "1d") {
      return filtered.slice(-2);
    }

    return filtered;
  }, [searchData, timeRange]);

  // Filter table data based on table time range
  const filteredTableData = useMemo(() => {
    if (!searchData.rawSearchData || !searchData.rawSearchData.length)
      return [];
    const now = Date.now();
    let cutoffTime;
    switch (tableTimeRange) {
      case "1d":
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case "7d":
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = 0;
    }
    return searchData.rawSearchData.filter(
      item => item.timestamp >= cutoffTime
    );
  }, [searchData, tableTimeRange]);

  // Load Chart.js dynamically with better error handling
  useEffect(() => {
    if ((window as any).Chart) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;

    script.onload = () => {
      console.log("Chart.js loaded successfully");
    };

    script.onerror = () => {
      console.error("Failed to load Chart.js");
      setError("Failed to load Chart.js library");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [setError]);

  // Create or update chart with better error handling
  useEffect(() => {
    // Wait for all dependencies to be ready
    if (
      !filteredData.length ||
      typeof (window as any).Chart === "undefined" ||
      !canvasRef.current
    ) {
      console.log("Chart dependencies not ready:", {
        hasData: filteredData.length > 0,
        hasChart: typeof (window as any).Chart !== "undefined",
        hasCanvas: !!canvasRef.current,
      });
      return;
    }

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      const chartData = {
        labels: filteredData.map(item => formatChartLabel(item.time)),
        datasets: [
          {
            label: "Total Searches",
            data: filteredData.map(item => item.searches),
            borderColor: "#3b82f6",
            backgroundColor:
              chartType === "bar" ? "#3b82f6" : "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: chartType === "line",
            tension: 0.4,
          },
        ],
      };

      const config = {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              display: true,
              title: { display: true, text: "Time (GMT)" },
              grid: { color: "rgba(0, 0, 0, 0.05)" },
            },
            y: {
              display: true,
              title: { display: true, text: "Count" },
              grid: { color: "rgba(0, 0, 0, 0.05)" },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (context: any) => {
                  const data = filteredData[context[0].dataIndex];
                  return `${formatChartLabel(data.time)} (GMT)`;
                },
                afterBody: (context: any) => {
                  const data = filteredData[context[0].dataIndex];
                  if (data.searchTerms && data.searchTerms.length > 0) {
                    return [
                      "",
                      "Popular searches:",
                      ...data.searchTerms.slice(0, 3),
                    ];
                  }
                  return [];
                },
              },
            },
            legend: { display: true, position: "top" },
          },
        },
      };

      chartInstance.current = new (window as any).Chart(ctx, config);
      console.log("Chart created successfully");
    } catch (error) {
      console.error("Error creating chart:", error);
      setError("Error creating chart visualization");
    }

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

  // Update searchData structure when processing
  useEffect(() => {
    if (Array.isArray(searchData) && searchData.length > 0) {
      // Convert old format to new format
      const processed = processSearchData(searchData);
      setSearchData(processed);
    }
  }, [searchData]);

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
          <p>Monitor search patterns and trends over time (GMT/ZULU Time)</p>
        </header>

        {error && (
          <div className="error-message">
            <p>
              {error} -{" "}
              {searchData.timeSeriesData && searchData.timeSeriesData.length > 0
                ? "Showing available data"
                : "Showing mock data for demonstration"}
            </p>
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
              <p className="stat-title">Average per Day</p>
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
              onChange={e => setTimeRange(e.target.value)}
            >
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
              onChange={e => setChartType(e.target.value as "line" | "bar")}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>

          <p className="data-points-info">{filteredData.length} data points</p>
        </div>

        <div className="card">
          <h2>Search Volume Over Time (GMT)</h2>
          <div className="chart-wrapper">
            <canvas ref={canvasRef} />
          </div>
          <div className="chart-instructions">
            <h3>Chart Features:</h3>
            <ul>
              <li>• Hover over data points to see detailed information</li>
              <li>
                • Use the time range selector to zoom in/out on different
                periods
              </li>
              <li>• Switch between line and bar chart views</li>
              <li>• Blue line shows total searches per day</li>
              <li>• All times are displayed in GMT/ZULU timezone</li>
            </ul>
          </div>
        </div>

        <div className="card table-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2>Recent Search Activity (GMT)</h2>
            <div className="control-group">
              <label>Show:</label>
              <select
                value={tableTimeRange}
                onChange={e => setTableTimeRange(e.target.value)}
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Search Term</th>
                  <th>Date Time (GMT)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableData.slice(0, 50).map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className="tag">{item.searchTerm}</span>
                    </td>
                    <td>{item.formattedTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTableData.length === 0 && (
              <p
                style={{ textAlign: "center", padding: "2rem", color: "#666" }}
              >
                No search activity found for the selected time range
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalyticsDashboard;
