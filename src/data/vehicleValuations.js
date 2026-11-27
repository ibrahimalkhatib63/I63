'use strict';

/**
 * Baseline valuation data used by the bidding price agent.
 * baseValue: approximate original/new market value (USD) used as the
 * starting point for the "car life" depreciation model.
 * annualDepreciationRate: fraction of remaining value lost per year of age.
 * mileageValuePerUnit: value lost per mile/km driven beyond the expected
 * annual average (used to penalize/reward mileage relative to age).
 */
const VEHICLE_BASELINES = [
  // Cars
  { make: 'Toyota', model: 'Camry', type: 'car', baseValue: 28000, annualDepreciationRate: 0.12 },
  { make: 'Honda', model: 'Civic', type: 'car', baseValue: 24000, annualDepreciationRate: 0.12 },
  { make: 'Ford', model: 'F-150', type: 'car', baseValue: 42000, annualDepreciationRate: 0.10 },
  { make: 'BMW', model: '3 Series', type: 'car', baseValue: 45000, annualDepreciationRate: 0.15 },
  { make: 'Tesla', model: 'Model 3', type: 'car', baseValue: 42000, annualDepreciationRate: 0.13 },
  { make: 'Chevrolet', model: 'Corvette', type: 'car', baseValue: 65000, annualDepreciationRate: 0.09 },
  { make: 'Jeep', model: 'Wrangler', type: 'car', baseValue: 38000, annualDepreciationRate: 0.09 },
  { make: 'Mercedes-Benz', model: 'C-Class', type: 'car', baseValue: 46000, annualDepreciationRate: 0.15 },
  { make: 'Audi', model: 'A4', type: 'car', baseValue: 41000, annualDepreciationRate: 0.15 },
  { make: 'Subaru', model: 'Outback', type: 'car', baseValue: 30000, annualDepreciationRate: 0.11 },

  // Motorcycles
  { make: 'Harley-Davidson', model: 'Sportster', type: 'motorcycle', baseValue: 12000, annualDepreciationRate: 0.10 },
  { make: 'Yamaha', model: 'YZF-R6', type: 'motorcycle', baseValue: 12500, annualDepreciationRate: 0.13 },
  { make: 'Ducati', model: 'Panigale V2', type: 'motorcycle', baseValue: 18000, annualDepreciationRate: 0.14 },
  { make: 'Honda', model: 'CBR600RR', type: 'motorcycle', baseValue: 12000, annualDepreciationRate: 0.13 },
  { make: 'Kawasaki', model: 'Ninja 650', type: 'motorcycle', baseValue: 8000, annualDepreciationRate: 0.12 },
  { make: 'Triumph', model: 'Bonneville T120', type: 'motorcycle', baseValue: 13000, annualDepreciationRate: 0.10 },
];

const EXPECTED_ANNUAL_MILES = { car: 12000, motorcycle: 3000 };

function findBaseline(make, model, type) {
  return VEHICLE_BASELINES.find(
    (v) =>
      v.make.toLowerCase() === make.toLowerCase() &&
      v.model.toLowerCase() === model.toLowerCase() &&
      v.type === type
  );
}

module.exports = { VEHICLE_BASELINES, EXPECTED_ANNUAL_MILES, findBaseline };
