export const weatherData = {
  "d-atis": {
    dataString:
      "ADW ATIS INFO X 0155Z. 30004KT 10SM CLR 15/M02 A2994 (TWO NINER NINER FOUR) RMK PRES ALT PS261 TEMP 59FAH. ILS, RWY 1L, 1R, VISUAL APPROACH, RWY 1L, 1R APPROACH IN USE. NOTAMS... RWY 19L DEPARTURE END BAK14, OTS, RWY 19L APPROACH END BAK14, OTS, RWY 1R SFL OTS. ALL ACFT MUST READ BACK HOLD SHORT INSTRUCTIONS. ALL ACFT TURN TRANSPONDERS ON WHEN ENTERING MOVEMENT AREA. CAUTION, BIRD CONDITION LOW, BASH PHASE 2 IN EFFECT. ...ADVS YOU HAVE INFO X.",
    highlight: ["ATIS INFO X", "A2994"],
  },
  metar: "lorem25",
  taf: "lorem25",
};

// use an excample string to search for the specific strings that neede to be lighlight
// (LLWS|WIND|LOW LEVEL hihglight text yellow
//fuiund a way to search for speicif texts and add css stylign on the frontend.

// DEN  highlight(ARR INFO L) 1953Z.
// 27025G33KT 10SM FEW080 SCT130 SCT200 01/M19 highlight(A2955) (TWO NINER FIVE FIVE)
// RMK AO2 PK WND 29040/1933 SLP040. highlight(LLWS ADZYS IN EFCT). HAZUS WX INFO FOR CO, KS, NE, WY AVBL FM FLT SVC.
// PIREP 30 SW DEN, 2005Z B58T RPRTD MDT-SVR, TB, BTN 14THSD AND 10 THSD DURD. PIREP DEN AREA,,
// 1929Z PC24 RPRTD MDT, TB, BTN AND FL 190 DURD. EXPC highlight(ILS, RNAV, OR VISUAL APCH, SIMUL APCHS IN USE, RWY 25, RWY 26.)
// NOTICE TO AIR MISSION. S C DEICE PAD CLOSED. DEN DME OTS. BIRD ACTIVITY VICINITY ARPT. ...ADVS

//ADW ATIS INFO X 0155Z. 30004KT 10SM CLR 15/M02 A2994 (TWO NINER NINER FOUR) RMK PRES ALT PS261 TEMP 59FAH. ILS, RWY 1L, 1R, VISUAL APPROACH, RWY 1L, 1R APPROACH IN USE. NOTAMS... RWY 19L DEPARTURE END BAK14, OTS, RWY 19L APPROACH END BAK14, OTS, RWY 1R SFL OTS. ALL ACFT MUST READ BACK HOLD SHORT INSTRUCTIONS. ALL ACFT TURN TRANSPONDERS ON WHEN ENTERING MOVEMENT AREA. CAUTION, BIRD CONDITION LOW, BASH PHASE 2 IN EFFECT. ...ADVS YOU HAVE INFO X.
