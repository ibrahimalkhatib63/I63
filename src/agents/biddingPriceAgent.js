'use strict';

const { findBaseline, EXPECTED_ANNUAL_MILES } = require('../data/vehicleValuations');

const DEFAULT_BASELINE_BY_TYPE = {
  car: { baseValue: 30000, annualDepreciationRate: 0.12 },
  motorcycle: { baseValue: 10000, annualDepreciationRate: 0.12 },
};

// grade 1 (poor) .. 5 (excellent)
const CONDITION_MULTIPLIER = { 1: 0.6, 2: 0.75, 3: 0.9, 4: 1.0, 5: 1.08 };

const DAMAGE_MULTIPLIER = {
  none: 1.0,
  minor: 0.9,
  moderate: 0.75,
  major: 0.55,
};

const TITLE_MULTIPLIER = {
  clean: 1.0,
  rebuilt: 0.7,
  salvage: 0.55,
  flood: 0.4,
};

const MILEAGE_VALUE_PER_UNIT = { car: 0.05, motorcycle: 0.35 };

// Fraction of estimated fair market value recommended as a bidding ceiling,
// leaving room for auction fees, transport, and reconditioning costs.
const BID_CEILING_MARGIN = 0.85;

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Estimates fair market value and a recommended maximum bid for an auction
 * listing based on the vehicle's "life": age, mileage, condition grade,
 * damage, and title status.
 */
function evaluateBiddingPrice(listing, { asOfYear = new Date().getFullYear() } = {}) {
  const baseline =
    findBaseline(listing.make, listing.model, listing.type) ||
    DEFAULT_BASELINE_BY_TYPE[listing.type] ||
    DEFAULT_BASELINE_BY_TYPE.car;

  const age = Math.max(0, asOfYear - listing.year);
  const ageAdjustedValue = baseline.baseValue * Math.pow(1 - baseline.annualDepreciationRate, age);

  const expectedMileage = (EXPECTED_ANNUAL_MILES[listing.type] || EXPECTED_ANNUAL_MILES.car) * age;
  const mileageDelta = listing.mileage - expectedMileage;
  const mileagePerUnit = MILEAGE_VALUE_PER_UNIT[listing.type] || MILEAGE_VALUE_PER_UNIT.car;
  const mileageAdjustment = -mileageDelta * mileagePerUnit;

  const conditionMultiplier = CONDITION_MULTIPLIER[listing.conditionGrade] ?? 1.0;
  const damageMultiplier = DAMAGE_MULTIPLIER[listing.damage] ?? 1.0;
  const titleMultiplier = TITLE_MULTIPLIER[listing.titleStatus] ?? 1.0;

  const estimatedMarketValue = Math.max(
    0,
    (ageAdjustedValue + mileageAdjustment) * conditionMultiplier * damageMultiplier * titleMultiplier
  );

  const recommendedMaxBid = round2(estimatedMarketValue * BID_CEILING_MARGIN);
  const currentBid = listing.currentBid ?? 0;
  const headroom = round2(recommendedMaxBid - currentBid);

  let recommendation;
  if (currentBid >= recommendedMaxBid) {
    recommendation = 'above-recommended-max';
  } else if (headroom / recommendedMaxBid < 0.05) {
    recommendation = 'near-recommended-max';
  } else {
    recommendation = 'good-value';
  }

  return {
    listingId: listing.id,
    estimatedMarketValue: round2(estimatedMarketValue),
    recommendedMaxBid,
    currentBid,
    headroom,
    recommendation,
    breakdown: {
      baseValue: baseline.baseValue,
      annualDepreciationRate: baseline.annualDepreciationRate,
      age,
      ageAdjustedValue: round2(ageAdjustedValue),
      expectedMileage: round2(expectedMileage),
      actualMileage: listing.mileage,
      mileageAdjustment: round2(mileageAdjustment),
      conditionGrade: listing.conditionGrade,
      conditionMultiplier,
      damage: listing.damage,
      damageMultiplier,
      titleStatus: listing.titleStatus,
      titleMultiplier,
      bidCeilingMargin: BID_CEILING_MARGIN,
    },
  };
}

module.exports = { evaluateBiddingPrice };
