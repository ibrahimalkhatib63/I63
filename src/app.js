'use strict';

const path = require('node:path');
const express = require('express');
const auctionRoutes = require('./routes/auctionRoutes');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ name: 'I63 Auction Agent', status: 'ok' });
  });

  app.use('/api/auctions', auctionRoutes);

  // Arabic search UI (public/index.html) is served at the site root.
  app.use(express.static(path.join(__dirname, '..', 'public')));

  return app;
}

module.exports = { createApp };
