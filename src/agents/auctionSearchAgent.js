'use strict';

const { AUCTION_LISTINGS } = require('../data/auctionListings');
const { evaluateBiddingPrice } = require('./biddingPriceAgent');
const { estimateUaeProfitability } = require('./uaeProfitAgent');

const RECOMMENDATION_RANK = { 'good-value': 0, 'near-recommended-max': 1, 'above-recommended-max': 2 };

function matchesText(value, query) {
  if (!query) return true;
  return String(value).toLowerCase().includes(String(query).toLowerCase());
}

function matchesYear(listing, { year, minYear, maxYear }) {
  if (year != null && listing.year !== Number(year)) return false;
  if (minYear != null && listing.year < Number(minYear)) return false;
  if (maxYear != null && listing.year > Number(maxYear)) return false;
  return true;
}

/**
 * Collects and searches auction listings for cars and motorcycles across
 * all known auction houses, matching a car by make/model/year/type and
 * attaching a recommended bidding price for each result.
 *
 * The listing source (currently seeded sample data) is isolated in
 * src/data/auctionListings.js so it can be swapped for a live API or
 * scraper without changing this search/pricing interface.
 *
 * By default, auctions that have already ended (auctionEndTime in the
 * past) are excluded; pass includeEnded: true to include them anyway.
 */
function searchAuctions({ make, model, type, year, minYear, maxYear, auctionHouse, includeEnded, now = new Date() } = {}) {
  const matches = AUCTION_LISTINGS.filter((listing) => {
    if (type && listing.type !== type) return false;
    if (!matchesText(listing.make, make)) return false;
    if (!matchesText(listing.model, model)) return false;
    if (!matchesYear(listing, { year, minYear, maxYear })) return false;
    if (!matchesText(listing.auctionHouse, auctionHouse)) return false;
    if (!includeEnded && new Date(listing.auctionEndTime) <= now) return false;
    return true;
  });

  const results = matches.map((listing) => {
    const pricing = evaluateBiddingPrice(listing);
    return { ...listing, pricing, uaeMarketEstimate: estimateUaeProfitability(listing, pricing) };
  });

  results.sort((a, b) => {
    const rankDiff = RECOMMENDATION_RANK[a.pricing.recommendation] - RECOMMENDATION_RANK[b.pricing.recommendation];
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.auctionEndTime) - new Date(b.auctionEndTime);
  });

  return {
    query: { make, model, type, year, minYear, maxYear, auctionHouse },
    count: results.length,
    auctionHouses: [...new Set(results.map((r) => r.auctionHouse))],
    results,
  };
}

module.exports = { searchAuctions };
