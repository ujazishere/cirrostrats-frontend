// Table.jsx
// This React component renders a table displaying flight gate information, including gate, flight number, scheduled time, and actual time. 
// It includes a title and a series of rows with flight details for easy reference.

import React from "react";

// Define the Table component
const Table = () => {
  return (
    // Container for the table
    <div className="table__container">
      {/* Table title */}
      <h2 className="table__title">Flight Gate Information</h2>

      {/* Table structure */}
      <table className="table">
        {/* Table header */}
        <thead>
          <tr className="table__header">
            <th>Gate</th>
            <th>Flight</th>
            <th>Scheduled</th>
            <th>Actual</th>
          </tr>
        </thead>

        {/* Table body with rows */}
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
        <tr>
          <td>TerminalC - C108</td>
          <td>UA146</td>
          <td>23:55, Mar 10</td>
          <td>00:25, Mar 11</td>
        </tr>
      </table>
    </div>
  );
};

export default Table;
