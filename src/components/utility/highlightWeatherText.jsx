/**
 * Utility functions for weather data processing and display
 */

/**
 * Highlights specific weather-related patterns in text with different colors
 * - Pink: Visibility values (e.g., "1/2SM")
 * - Red: Low ceiling (BKN/OVC004 or lower)
 * - Yellow: Medium ceiling (BKN/OVC005-009)
 * - Box: Altimeter settings (e.g., "A2992")
 */
const highlightWeatherText = (text) => {
  if (!text) return "";
  const pinkPattern = /((M)?\d\/(\d)?\dSM)/g;  // Matches visibility values
  const redPattern = /(BKN|OVC)(00[0-4])/g;    // Matches low ceilings
  const yellowPattern = /(BKN|OVC)(00[5-9])/g;  // Matches medium ceilings
  const altimeterPattern = /(A\d{4})/g;         // Matches altimeter settings
  
  return text
    .replace(pinkPattern, '<span class="pink_text_color">$1</span>')
    .replace(redPattern, '<span class="red_text_color">$1$2</span>')
    .replace(yellowPattern, '<span class="yellow_highlight">$1$2</span>')
    .replace(altimeterPattern, '<span class="box_around_text">$1</span>');
};

export { highlightWeatherText };