'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBiddingPrice } = require('../src/agents/biddingPriceAgent');
const { estimateUaeProfitability } = require('../src/agents/uaeProfitAgent');

test('converts USD figures to AED using the fixed peg rate', () => {
  const listing = {
    id: 'A',
    type: 'car',
    make: 'Jeep',
    model: 'Wrangler',
    year: 2022,
    mileage: 10000,
    conditionGrade: 5,
    damage: 'none',
    titleStatus: 'clean',
    currentBid: 5000,
  };
  const pricing = evaluateBiddingPrice(listing, { asOfYear: 2026 });
  const uae = estimateUaeProfitability(listing, pricing);

  assert.equal(uae.uaeCleanResaleValueAED, Math.round(uae.uaeCleanResaleValueUSD * 3.6725 * 100) / 100);
});

test('a low-mileage, excellent-condition, high-UAE-demand car shows a positive profit margin', () => {
  const listing = {
    id: 'B',
    type: 'car',
    make: 'Jeep',
    model: 'Wrangler',
    year: 2023,
    mileage: 3000,
    conditionGrade: 5,
    damage: 'none',
    titleStatus: 'clean',
    currentBid: 100,
  };
  const pricing = evaluateBiddingPrice(listing, { asOfYear: 2026 });
  const uae = estimateUaeProfitability(listing, pricing);

  assert.notEqual(uae.status, 'not-profitable');
  assert.ok(uae.profitUSD > 0);
});

test('an old, high-mileage, heavily damaged low-value car is not worth shipping/importing', () => {
  const listing = {
    id: 'C',
    type: 'car',
    make: 'Honda',
    model: 'Civic',
    year: 2008,
    mileage: 220000,
    conditionGrade: 1,
    damage: 'major',
    titleStatus: 'flood',
    currentBid: 0,
  };
  const pricing = evaluateBiddingPrice(listing, { asOfYear: 2026 });
  const uae = estimateUaeProfitability(listing, pricing);

  assert.equal(uae.status, 'not-profitable');
  assert.ok(uae.profitUSD <= 0);
});

test('reconditioning and retitle costs scale with reported damage and title status', () => {
  const base = {
    id: 'D',
    type: 'motorcycle',
    make: 'Ducati',
    model: 'Panigale V2',
    year: 2021,
    mileage: 3000,
    conditionGrade: 4,
    currentBid: 0,
  };
  const pricingClean = evaluateBiddingPrice({ ...base, damage: 'none', titleStatus: 'clean' }, { asOfYear: 2026 });
  const uaeClean = estimateUaeProfitability({ ...base, damage: 'none', titleStatus: 'clean' }, pricingClean);

  const pricingDamaged = evaluateBiddingPrice({ ...base, damage: 'major', titleStatus: 'salvage' }, { asOfYear: 2026 });
  const uaeDamaged = estimateUaeProfitability({ ...base, damage: 'major', titleStatus: 'salvage' }, pricingDamaged);

  assert.equal(uaeClean.breakdown.reconditioningCostUSD, 0);
  assert.equal(uaeClean.breakdown.retitleCostUSD, 0);
  assert.ok(uaeDamaged.breakdown.reconditioningCostUSD > 0);
  assert.ok(uaeDamaged.breakdown.retitleCostUSD > 0);
});
