'use strict';

const { findUaeDemandMultiplier } = require('../data/uaeMarketAdjustments');
const { calculateTotalCopartFees } = require('../data/copartFees');

// AED is pegged to USD by the UAE Central Bank at this fixed rate.
const AED_PER_USD = 3.6725;

const SHIPPING_COST_USD = { car: 1200, motorcycle: 350 };
// Non-Copart auction houses (IAAI, Manheim, Cars & Bids, Bring a Trailer) each
// have their own fee schedules that aren't modeled here yet; this flat rate
// is a rough stand-in for them. Copart listings use the real tiered schedule
// in src/data/copartFees.js instead.
const GENERIC_AUCTION_FEE_RATE = 0.10;
const UAE_CUSTOMS_DUTY_RATE = 0.05; // standard UAE import duty on CIF value
const UAE_VAT_RATE = 0.05; // UAE VAT, applied on the duty-inclusive value

// Extra cost to recondition/repair before resale, as a fraction of the
// clean UAE resale value, based on the damage reported at auction.
const RECONDITION_RATE_BY_DAMAGE = { none: 0, minor: 0.03, moderate: 0.08, major: 0.15 };

// Flat extra cost for retitling/inspection when the vehicle carries a
// non-clean title (UAE registration typically requires extra inspection).
const RETITLE_COST_BY_STATUS = { clean: 0, rebuilt: 300, salvage: 500, flood: 700 };

const MIN_PROFITABLE_MARGIN_PERCENT = 15;
const MIN_MARGINAL_MARGIN_PERCENT = 0;

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Estimates whether importing and reselling a given auction listing in the
 * UAE would be profitable. Uses whichever is higher of the current bid or
 * the recommended max bid as the attainable purchase price (you can never
 * win below the current bid), then adds auction fees, shipping, UAE
 * customs duty + VAT, and reconditioning costs, and compares the total
 * landed cost against an estimated UAE clean resale value.
 *
 * This uses heuristic demand multipliers (src/data/uaeMarketAdjustments.js)
 * rather than live UAE market data — treat the output as indicative.
 */
function estimateUaeProfitability(listing, pricingResult) {
  const purchasePriceUSD = Math.max(pricingResult.currentBid, pricingResult.recommendedMaxBid);

  const isCopart = listing.auctionHouse === 'Copart';
  const copartFees = isCopart ? calculateTotalCopartFees(purchasePriceUSD, listing.type) : null;
  const auctionFeesUSD = isCopart ? copartFees.totalUSD : round2(purchasePriceUSD * GENERIC_AUCTION_FEE_RATE);
  const shippingCostUSD = SHIPPING_COST_USD[listing.type] ?? SHIPPING_COST_USD.car;

  const cifValueUSD = purchasePriceUSD + auctionFeesUSD + shippingCostUSD;
  const customsDutyUSD = round2(cifValueUSD * UAE_CUSTOMS_DUTY_RATE);
  const vatUSD = round2((cifValueUSD + customsDutyUSD) * UAE_VAT_RATE);

  const uaeDemandMultiplier = findUaeDemandMultiplier(listing.make, listing.model, listing.type);
  const cleanValueBeforeDemand = Math.max(
    0,
    pricingResult.breakdown.ageAdjustedValue + pricingResult.breakdown.mileageAdjustment
  );
  const uaeCleanResaleValueUSD = round2(
    cleanValueBeforeDemand * pricingResult.breakdown.conditionMultiplier * uaeDemandMultiplier
  );

  const reconditionRate = RECONDITION_RATE_BY_DAMAGE[listing.damage] ?? 0;
  const reconditioningCostUSD = round2(uaeCleanResaleValueUSD * reconditionRate);
  const retitleCostUSD = RETITLE_COST_BY_STATUS[listing.titleStatus] ?? 0;

  const totalLandedCostUSD = round2(
    cifValueUSD + customsDutyUSD + vatUSD + reconditioningCostUSD + retitleCostUSD
  );

  const profitUSD = round2(uaeCleanResaleValueUSD - totalLandedCostUSD);
  const profitMarginPercent = totalLandedCostUSD > 0 ? round2((profitUSD / totalLandedCostUSD) * 100) : 0;

  let status;
  if (profitMarginPercent >= MIN_PROFITABLE_MARGIN_PERCENT) {
    status = 'profitable';
  } else if (profitMarginPercent > MIN_MARGINAL_MARGIN_PERCENT) {
    status = 'marginal';
  } else {
    status = 'not-profitable';
  }

  return {
    listingId: listing.id,
    currency: 'USD',
    aedPerUsd: AED_PER_USD,
    uaeCleanResaleValueUSD,
    uaeCleanResaleValueAED: round2(uaeCleanResaleValueUSD * AED_PER_USD),
    totalLandedCostUSD,
    totalLandedCostAED: round2(totalLandedCostUSD * AED_PER_USD),
    profitUSD,
    profitAED: round2(profitUSD * AED_PER_USD),
    profitMarginPercent,
    status,
    breakdown: {
      purchasePriceUSD,
      auctionFeesUSD,
      auctionFeeSource: isCopart ? 'copart-fee-schedule' : 'generic-estimate',
      copartFeeBreakdown: copartFees,
      shippingCostUSD,
      cifValueUSD: round2(cifValueUSD),
      customsDutyUSD,
      vatUSD,
      uaeDemandMultiplier,
      reconditioningCostUSD,
      retitleCostUSD,
    },
    note:
      'Estimate based on heuristic UAE demand multipliers and a publicly reconstructed Copart fee schedule, not live market data or Copart\'s authoritative member fees.',
  };
}

module.exports = { estimateUaeProfitability };
