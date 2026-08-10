'use strict';

const express = require('express');
const auctionRoutes = require('./routes/auctionRoutes');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({ name: 'I63 Auction Agent', status: 'ok' });
  });

  app.use('/api/auctions', auctionRoutes);

  return app;
}

module.exports = { createApp };
