'use strict';

/**
 * Indicative UAE resale-demand multipliers relative to the US baseline
 * valuation in vehicleValuations.js. These are heuristic estimates (not
 * live UAE market data) meant to approximate how much more/less a given
 * make/model tends to fetch when resold in the UAE, e.g. German luxury
 * and off-road SUVs trend higher, plain economy sedans trend lower.
 */
const UAE_DEMAND_MULTIPLIERS = [
  { make: 'Toyota', model: 'Camry', type: 'car', multiplier: 1.05 },
  { make: 'Honda', model: 'Civic', type: 'car', multiplier: 0.95 },
  { make: 'Ford', model: 'F-150', type: 'car', multiplier: 0.85 },
  { make: 'BMW', model: '3 Series', type: 'car', multiplier: 1.10 },
  { make: 'Tesla', model: 'Model 3', type: 'car', multiplier: 0.90 },
  { make: 'Chevrolet', model: 'Corvette', type: 'car', multiplier: 0.95 },
  { make: 'Jeep', model: 'Wrangler', type: 'car', multiplier: 1.15 },
  { make: 'Mercedes-Benz', model: 'C-Class', type: 'car', multiplier: 1.10 },
  { make: 'Audi', model: 'A4', type: 'car', multiplier: 1.05 },
  { make: 'Subaru', model: 'Outback', type: 'car', multiplier: 0.85 },

  { make: 'Harley-Davidson', model: 'Sportster', type: 'motorcycle', multiplier: 1.00 },
  { make: 'Yamaha', model: 'YZF-R6', type: 'motorcycle', multiplier: 1.05 },
  { make: 'Ducati', model: 'Panigale V2', type: 'motorcycle', multiplier: 1.15 },
  { make: 'Honda', model: 'CBR600RR', type: 'motorcycle', multiplier: 1.05 },
  { make: 'Kawasaki', model: 'Ninja 650', type: 'motorcycle', multiplier: 1.00 },
  { make: 'Triumph', model: 'Bonneville T120', type: 'motorcycle', multiplier: 0.95 },
];

const DEFAULT_MULTIPLIER_BY_TYPE = { car: 1.0, motorcycle: 1.0 };

function findUaeDemandMultiplier(make, model, type) {
  const entry = UAE_DEMAND_MULTIPLIERS.find(
    (v) =>
      v.make.toLowerCase() === make.toLowerCase() &&
      v.model.toLowerCase() === model.toLowerCase() &&
      v.type === type
  );
  return entry ? entry.multiplier : DEFAULT_MULTIPLIER_BY_TYPE[type] ?? 1.0;
}

module.exports = { UAE_DEMAND_MULTIPLIERS, findUaeDemandMultiplier };
