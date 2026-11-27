'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { searchAuctions } = require('../src/agents/auctionSearchAgent');

test('searches across all auction houses for a given make/model', () => {
  const { results, auctionHouses } = searchAuctions({ make: 'Toyota', model: 'Camry' });

  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.make === 'Toyota' && r.model === 'Camry'));
  assert.ok(auctionHouses.length > 0);
});

test('filters by vehicle type (motorcycle) and excludes cars', () => {
  const { results } = searchAuctions({ type: 'motorcycle' });

  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.type === 'motorcycle'));
});

test('returns no matches for a make that does not exist in any listing', () => {
  const { results, count } = searchAuctions({ make: 'DoesNotExist' });
  assert.equal(count, 0);
  assert.deepEqual(results, []);
});

test('excludes auctions that have already ended, unless includeEnded is set', () => {
  const now = new Date('2026-08-10T00:00:00Z');
  const ended = searchAuctions({ make: 'Toyota', model: 'Camry', now });
  assert.ok(ended.results.every((r) => new Date(r.auctionEndTime) > now));

  const past = new Date('2100-01-01T00:00:00Z');
  const excluded = searchAuctions({ make: 'Toyota', model: 'Camry', now: past });
  assert.equal(excluded.count, 0);

  const included = searchAuctions({ make: 'Toyota', model: 'Camry', now: past, includeEnded: true });
  assert.ok(included.count > 0);
});

test('each result includes which auction house it is in and a recommended bid', () => {
  const { results } = searchAuctions({ make: 'Ducati' });

  assert.ok(results.length > 0);
  for (const r of results) {
    assert.ok(r.auctionHouse);
    assert.ok(r.pricing);
    assert.ok(typeof r.pricing.recommendedMaxBid === 'number');
  }
});

test('sorts best-value results before ones already above the recommended max', () => {
  const { results } = searchAuctions({});
  const ranks = results.map((r) =>
    r.pricing.recommendation === 'good-value' ? 0 : r.pricing.recommendation === 'near-recommended-max' ? 1 : 2
  );
  const sorted = [...ranks].sort((a, b) => a - b);
  assert.deepEqual(ranks, sorted);
});
