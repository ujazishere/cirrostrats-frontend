//TODO: prone to errors what if mdb fields change? MDB fields should be unique.
export const getObjectType = (obj) => {
  if (obj.name && obj.code) return 'name';  // It's an airport
  if (obj.flightID) return 'flightID';  // It's a flight
  if (obj.Gate) return 'Gate';  // It's a gate
  return null;
}