import "../components/CSS/Source.css";

const Source = () => {
  // List of sources for data
  const sources = [
    { url: "https://www.aviationweather.gov", label: "Aviation Weather" },
    { url: "https://www.airport-ewr.com", label: "Airport EWR" },
    { url: "https://www.flightstats.com", label: "Flight Stats" },
    { url: "https://nasstatus.faa.gov/", label: "NAS Stats" },
    { url: "https://datis.clowd.io/", label: "Datis Stats" },
    { url: "https://www.flightaware.com", label: "Flight Aware" },
    { url: "https://www.aviationstack.com", label: "Aviation Stack" },
  ];

  return (
    <div className="source-container">
      <div className="source">
        <div className="source-header">
          <h1 className="source__title">Data Sources</h1>
          <div className="source__divider"></div>
          <p className="source__subtitle">
            We aggregate data from trusted aviation sources to provide you with
            accurate and up-to-date information
          </p>
        </div>

        <div className="source-content">
          <div className="links-grid">
            {sources.map((source, index) => (
              <div key={index} className="source-card">
                <div className="source-card__header">
                  <h3 className="source-card__title">
                    {source.label || "Aviation Data"}
                  </h3>
                </div>
                <div className="source-card__content">
                  <p className="source-card__url">{source.url}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-card__link"
                  >
                    <span>Visit Source</span>
                    <svg
                      className="source-card__icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17L17 7"></path>
                      <path d="M7 7h10v10"></path>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="source-footer">
            <div className="source-info">
              <h3 className="source-info__title">Data Reliability</h3>
              <p className="source-info__text">
                We utilize and monitor multiple data sources, but their accuracy
                can vary. Pilots should access aviation information with caution
                and verify critical data through multiple sources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Source;
