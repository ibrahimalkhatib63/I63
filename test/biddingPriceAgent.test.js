'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBiddingPrice } = require('../src/agents/biddingPriceAgent');

test('a newer, low-mileage, excellent-condition car values above an older high-mileage one', () => {
  const fresh = evaluateBiddingPrice(
    {
      id: 'A',
      type: 'car',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      mileage: 5000,
      conditionGrade: 5,
      damage: 'none',
      titleStatus: 'clean',
      currentBid: 0,
    },
    { asOfYear: 2026 }
  );

  const worn = evaluateBiddingPrice(
    {
      id: 'B',
      type: 'car',
      make: 'Toyota',
      model: 'Camry',
      year: 2014,
      mileage: 160000,
      conditionGrade: 2,
      damage: 'moderate',
      titleStatus: 'clean',
      currentBid: 0,
    },
    { asOfYear: 2026 }
  );

  assert.ok(fresh.estimatedMarketValue > worn.estimatedMarketValue);
  assert.ok(fresh.recommendedMaxBid > worn.recommendedMaxBid);
});

test('salvage/flood title status sharply reduces recommended bid vs. clean title', () => {
  const base = {
    id: 'C',
    type: 'car',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    mileage: 20000,
    conditionGrade: 4,
    damage: 'none',
    currentBid: 0,
  };

  const clean = evaluateBiddingPrice({ ...base, titleStatus: 'clean' }, { asOfYear: 2026 });
  const flood = evaluateBiddingPrice({ ...base, titleStatus: 'flood' }, { asOfYear: 2026 });

  assert.ok(flood.recommendedMaxBid < clean.recommendedMaxBid * 0.6);
});

test('recommendation flags when current bid already exceeds the recommended max', () => {
  const evaluation = evaluateBiddingPrice(
    {
      id: 'D',
      type: 'motorcycle',
      make: 'Yamaha',
      model: 'YZF-R6',
      year: 2015,
      mileage: 30000,
      conditionGrade: 2,
      damage: 'major',
      titleStatus: 'salvage',
      currentBid: 50000,
    },
    { asOfYear: 2026 }
  );

  assert.equal(evaluation.recommendation, 'above-recommended-max');
  assert.ok(evaluation.headroom < 0);
});

test('unknown make/model falls back to a type-based default baseline instead of throwing', () => {
  const evaluation = evaluateBiddingPrice(
    {
      id: 'E',
      type: 'car',
      make: 'Unknown Make',
      model: 'Unknown Model',
      year: 2022,
      mileage: 15000,
      conditionGrade: 4,
      damage: 'none',
      titleStatus: 'clean',
      currentBid: 0,
    },
    { asOfYear: 2026 }
  );

  assert.ok(evaluation.estimatedMarketValue > 0);
});
