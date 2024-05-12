import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Details = () => {
  const [airportData, setAirportData] = useState([]);
  const location = useLocation();
  const searchValue = location?.state?.searchValue;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/dummy`);
        if (res.status !== 200) {
          throw new Error("Network error occurred");
        }
        setAirportData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        // Handle error state or display an error message
      }
    }
    if (searchValue) {
      fetchData();
    }
  }, [searchValue]);

  return (
    <div className="details">
      {/* <h2 className="details__title">United Flight Information</h2> */}

      <div className="detail">
        {/* <h3>▼ {title}</h3> */}
      </div>
      
      <div className="details__card">
        <h3 className="details__card__title">UA492 N37502</h3>

        <div className="detail__body">
          <div className="detail__depature">
            <h3 className="detail__depature__title">KEWR</h3>

            <div className="detail__gate">
              <p className="detail__gate__title">Gate</p>
              <h3>C - C111</h3>
            </div>
            <div className="detail__depature__time">
              <p className="detail__depature__local">Scheduled Local</p>
              <h3>05:40 EST</h3>
            </div>
            <div className="detail__depature__utc__time">
              <p className="detail__depature__utc">UTC</p>
              <h3>STD 1040Z</h3>
              <h3>ETD 1040Z</h3>
            </div>
          </div>

          <div className="detail__arrival">
            <h3 className="detail__arrival__title ">KIAH</h3>

            <div className="detail__gate">
              <p className="detail__gate__title">Gate</p>
              <h3>C - C39</h3>
            </div>
            <div className="detail__arrival__time">
              <p className="detail__arrival__local"> Scheduled Local</p>
              <h3>08:49 CST</h3>
            </div>
            <div className="detail__arrival__utc__time">
              <p className="detail__arrival__utc">UTC</p>
              <h3>STA 1449Z</h3>
              <h3>STA 1449Z</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>
                <div className="header-button">Departure</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: "100%", textAlign: "left" }}>
                <span style={{ float: "left", width: "33%" }}>11:35 EDT</span>
                <span style={{ float: "left", width: "33%", textAlign: "center" }}>KBOS</span>
                <span style={{ float: "right", width: "33%", textAlign: "right" }}>B-B24</span>
              </td>
            </tr>
            <tr>
              <td>D-ATIS <span className="small-text">56 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                BOS ATIS INFO O 1854Z. 14009KT 10SM FEW040 SCT080 BKN100 BKN250 13/07 A2988 (TWO NINER EIGHT EIGHT) RMK SLP117 VIRGA DSNT S. APPROACHES ARE BEING CONDUCTED TO PARALLEL RUNWAYS. ILS 4R, VA 4L, DEP 9. RWY 33R IS APPROVED FOR TURN OFF. READBACK ALL HOLD SHORT INSTRCNS AND ASSIGNED ALTITUDES. INCREASED BIRD ACTIVITY IN THE VICINITY OF LOGAN AIRPORT. NUMEROUS CRANES IN BOSTON AREA AND IN VICINITY OF LOGAN AIRPORT. NOTAM 04/191 IN EFFECT FOR GENERAL AVIATION RAMP CONGESTION. ...ADVS YOU HAVE INFO O.
              </td>
            </tr>
            <tr>
              <td>METAR <span className="small-text">56 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                KBOS 121854Z 12009KT 10SM FEW040 SCT080 BKN100 BKN250 13/07 A2988 RMK AO2 SLP117 VIRGA DSNT S T01280072
              </td>
            </tr>
            <tr>
              <td>TAF <span className="small-text">139 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                KBOS 121731Z 1218/1324 12010KT P6SM FEW030 BKN070
                FM130000 19005KT P6SM BKN050
                FM130500 24005KT P6SM SCT060
                FM131600 13006KT P6SM FEW070
                FM132200 17010KT P6SM SCT060
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <table class="route">
            <tr>
                <th>ROUTE Show on - SkyVector Map </th>
            </tr>
            <tr>
                <td>FL340 AGDOX Q816 HOCKE MONEE BAE HELLO SAUGI PORDR AALLE3</td>
            </tr>
        </table>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>
                <div className="header-button">Destination</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: "100%", textAlign: "left" }}>
                <span style={{ float: "left", width: "33%" }}>14:17 MDT</span>
                <span style={{ float: "left", width: "33%", textAlign: "center" }}>KDEN</span>
                <span style={{ float: "right", width: "33%", textAlign: "right" }}>B-B47</span>
              </td>
            </tr>
            <tr>
              <td>D-ATIS <span className="small-text">16 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                DEN DEP INFO K 2053Z. 19007KT 10SM FEW045 SCT100 BKN200 13/08 A2994 (TWO NINER NINER FOUR) RMK AO2 SLP096 60011 53003. LLWS ADZYS IN EFCT. HAZUS WX INFO FOR CO, KS, NE, WY AVBL FM FLT SVC. DEPG RWY8, RWY17L, RWY25. NOTICE TO AIR MISSION. TWY ED CLSD BTN TWY P7 AND TWY M .. DEN DME OTS. BIRD ACTIVITY VICINITY ARPT. ALL ACFT IN CONCOURSE AREA ADZ RAMP TWR OF DP AND TRSN. ...ADVS YOU HAVE INFO K.
              </td>
            </tr>
            <tr>
              <td>METAR <span className="small-text">16 mins ago</span></td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace" }}>
                KDEN 122053Z 20007KT 10SM FEW045 SCT100 BKN200 13/08 A2994 RMK AO2 SLP096 60011 T01280083 53003 $
              </td>
            </tr>
            <tr>
              <td>TAF <span className="small-text">10 mins ago</span></td>
            </tr>
            <tr style={{ textOverflow: "ellipsis" }}>
              <td style={{ textAlign: "left", fontFamily: "Menlo, monospace", whiteSpace: "wrap", textOverflow: "ellipsis", maxHeight: "none", height: "auto" }}>
                KDEN 122059Z 1221/1324 21006KT P6SM VCSH BKN060 BKN100
                FM130000 14006KT P6SM SCT060 SCT100
                FM130500 21007KT P6SM SCT100
                FM131500 VRB06KT P6SM SCT120
                FM131900 01008KT P6SM SCT070
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;
