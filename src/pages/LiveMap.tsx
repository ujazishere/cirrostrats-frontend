const LiveMap = () => {
  return (
    // Use the class name for the container
    <div className="map-container">
      {/* This is the live radar loop.
        It uses the 'map-image' class from your CSS file.
      */}
      <img
        src="https://radar.weather.gov/ridge/standard/CONUS-LARGE_loop.gif"
        alt="NWS Weather Radar Loop"
        className="map-image"
      />

      {/* This is the aviation forecast map.
        It also uses the 'map-image' class.
        You can remove this img tag if you only want to show the first map.
      */}
    </div>
  );
};

export default LiveMap;
