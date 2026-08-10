'use strict';

const express = require('express');
const { searchAuctions } = require('../agents/auctionSearchAgent');

const router = express.Router();

const VALID_TYPES = new Set(['car', 'motorcycle']);

// GET /api/auctions/search?make=&model=&type=&year=&minYear=&maxYear=&auctionHouse=&includeEnded=
router.get('/search', (req, res) => {
  const { make, model, type, year, minYear, maxYear, auctionHouse, includeEnded } = req.query;

  if (type && !VALID_TYPES.has(type)) {
    return res.status(400).json({ error: `type must be one of: ${[...VALID_TYPES].join(', ')}` });
  }

  const result = searchAuctions({
    make,
    model,
    type,
    year,
    minYear,
    maxYear,
    auctionHouse,
    includeEnded: includeEnded === 'true',
  });
  res.json(result);
});

module.exports = router;
