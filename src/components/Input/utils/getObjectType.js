//TODO: prone to errors what if mdb fields change? MDB fields should be unnique.
export const getObjectType = (obj) => {
  if (obj.name && obj.code) return 'name';  // It's an airport
  if (obj.flightNumber) return 'flightNumber';  // It's a flight
  if (obj.Gate) return 'Gate';  // It's a gate
  return null;
}