'use strict';

/**
 * Approximate Copart public/internet-bidder buyer fee schedule. Copart's
 * actual fees vary by member type, purchase history, and yard location and
 * require a member login to view precisely — these tiers are reconstructed
 * from publicly published third-party fee calculators/guides and should be
 * treated as an estimate, not Copart's authoritative schedule.
 */
const BUYER_FEE_TIERS = [
  { max: 399.99, fee: 75 },
  { max: 899.99, fee: 135 },
  { max: 1399.99, fee: 185 },
  { max: 1999.99, fee: 235 },
  { max: 2499.99, fee: 285 },
  { max: 2999.99, fee: 335 },
  { max: 3499.99, fee: 385 },
  { max: 3999.99, fee: 435 },
  { max: 4499.99, fee: 485 },
  { max: 4999.99, fee: 535 },
];
const BUYER_FEE_RATE_ABOVE_TOP_TIER = 0.10; // 10% of sale price for bids at/above $5,000

const INTERNET_BID_FEE_USD = 59;
const GATE_FEE_USD = { car: 65, motorcycle: 65 };
const ENVIRONMENTAL_FEE_USD = 15;
const TITLE_FEE_USD = 75;

function calculateCopartBuyerFee(bidAmountUSD) {
  const tier = BUYER_FEE_TIERS.find((t) => bidAmountUSD <= t.max);
  return tier ? tier.fee : Math.round(bidAmountUSD * BUYER_FEE_RATE_ABOVE_TOP_TIER * 100) / 100;
}

/**
 * Total Copart buyer-side fees for a given winning bid: the tiered buyer
 * fee plus the standard flat fees charged on every purchase.
 */
function calculateTotalCopartFees(bidAmountUSD, vehicleType) {
  const buyerFeeUSD = calculateCopartBuyerFee(bidAmountUSD);
  const gateFeeUSD = GATE_FEE_USD[vehicleType] ?? GATE_FEE_USD.car;
  const totalUSD =
    Math.round((buyerFeeUSD + INTERNET_BID_FEE_USD + gateFeeUSD + ENVIRONMENTAL_FEE_USD + TITLE_FEE_USD) * 100) / 100;

  return {
    buyerFeeUSD,
    internetBidFeeUSD: INTERNET_BID_FEE_USD,
    gateFeeUSD,
    environmentalFeeUSD: ENVIRONMENTAL_FEE_USD,
    titleFeeUSD: TITLE_FEE_USD,
    totalUSD,
  };
}

module.exports = { calculateCopartBuyerFee, calculateTotalCopartFees };
