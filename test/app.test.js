'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp } = require('../src/app');

function request(server, path) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}${path}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      })
      .on('error', reject);
  });
}

test('GET /api/auctions/search returns matching listings with pricing', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const { status, body } = await request(server, '/api/auctions/search?make=Honda&type=car');

  assert.equal(status, 200);
  assert.ok(body.count > 0);
  assert.ok(body.results.every((r) => r.make === 'Honda' && r.type === 'car'));
  assert.ok(body.results[0].pricing.recommendedMaxBid > 0);
});

test('GET /api/auctions/search rejects an invalid type', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const { status, body } = await request(server, '/api/auctions/search?type=airplane');

  assert.equal(status, 400);
  assert.ok(body.error);
});
