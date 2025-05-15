/**
 * ClearanceTable component displays flight clearance information 
 * in a separate table below the SummaryTable
 */
import React from 'react';

/**
 * Displays flight clearance information in a separate table
 * @param {Object} props
 * @param {Object} props.flightData - Flight information containing clearance details
 */
const ClearanceTable = ({ clearance }) => {
  return (
    <div className="clearance-table-container">
      <h3 className="clearance-table-title">Clearance</h3>
      <div className="clearance-table-content">{clearance}</div>
    </div>
  );
};

export default ClearanceTable;