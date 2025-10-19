import React from "react";
import { Clock } from "lucide-react";

interface RawDataItem {
  timestamp: string;
  fid_st?: string;
  airport_st?: string;
  rst?: string;
  "Terminal/Gate"?: string;
  [key: string]: any;
}

interface SearchTimelineProps {
  rawData: RawDataItem[];
}

const SearchTimeline: React.FC<SearchTimelineProps> = ({ rawData }) => {
  // Sort data by timestamp (newest first)
  const sortedData = [...rawData].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "10px",
          color: "#333",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Clock size={20} /> Search Timeline
      </h2>

      <div
        style={{
          borderLeft: "2px solid #e0e0e0",
          paddingLeft: "20px",
        }}
      >
        {sortedData.map((item, index) => (
          <div
            key={index}
            style={{
              // marginBottom: '24px',
              position: "relative",
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                position: "absolute",
                left: "-26px",
                top: "4px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: item.fid_st ? "#3b82f6" : "#10b981",
                border: "2px solid white",
              }}
            />

            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                padding: "12px 16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "3px",
                }}
              >
                <span style={{ fontWeight: "600", color: "#1e40af" }}>
                  {/* TODO: Also account for other fields - extended suggestions fetch are not accounted for - SWA, JBU and such*/}
                  {item.fid_st
                    ? `Flight: ${item.fid_st}`
                    : item.airport_st
                      ? `Airport: ${item.airport_st}`
                      : item.rst
                        ? `Raw: ${item.rst}`
                        : item["Terminal/Gate"]
                          ? `Terminal/Gate: ${item["Terminal/Gate"]}`
                          : "Unknown"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.875rem",
                  color: "#64748b",
                }}
              >
                <Clock size={12} />
                {
                  // new Date(item.timestamp).getUTCDate() + ' ' +
                  new Date(item.timestamp)
                    .toDateString()
                    .toString()
                    .slice(8, 10) +
                    " " +
                    new Date(item.timestamp)
                      .toTimeString()
                      .toString()
                      .slice(0, 2) +
                    new Date(item.timestamp)
                      .toTimeString()
                      .toString()
                      .slice(3, 5) +
                    "Z"
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchTimeline;
