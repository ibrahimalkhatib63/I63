# I63
A MARKET PLACE FOR CAR SERVICES

## Auction Search & Bidding Agent

Searches auction listings for cars and motorcycles across multiple auction
houses (Copart, IAAI, Manheim, Cars & Bids, Bring a Trailer) by make, model,
year, or type, and recommends a maximum bidding price for each result based
on the vehicle's "life": age, mileage, condition grade, damage, and title
status.

The listing data is currently seeded sample data (`src/data/auctionListings.js`)
so the feature is runnable without any external API keys. It's isolated
behind `src/agents/auctionSearchAgent.js` so a live auction API or scraper
can be swapped in later without changing the search/pricing interface.

### Run it

```bash
npm install
npm start
# then, in another terminal:
curl "http://localhost:3000/api/auctions/search?make=Toyota&model=Camry"
curl "http://localhost:3000/api/auctions/search?type=motorcycle"
```

Query parameters (all optional, combine as needed):

| Param          | Example         | Description                                |
|----------------|-----------------|--------------------------------------------|
| `make`         | `Toyota`        | Vehicle make (partial match)               |
| `model`        | `Camry`         | Vehicle model (partial match)               |
| `type`         | `car` / `motorcycle` | Restrict to cars or motorcycles       |
| `year`         | `2020`          | Exact model year                           |
| `minYear`      | `2018`          | Minimum model year                         |
| `maxYear`      | `2022`          | Maximum model year                         |
| `auctionHouse` | `Copart`        | Restrict to a specific auction house       |
| `includeEnded` | `true`         | Include auctions whose end time has passed (excluded by default) |

Each result includes which auction house it's listed in, the current bid,
a `pricing` object with the estimated fair market value, a recommended
maximum bid, and a full breakdown of how it was calculated, and a
`uaeMarketEstimate` object indicating whether importing and reselling that
specific vehicle in the UAE looks profitable, marginal, or not worth it —
see below.

### UAE import/resale profitability estimate

For every result, `uaeMarketEstimate` (see `src/agents/uaeProfitAgent.js`)
estimates:

- the attainable purchase price — whichever is higher of the current bid or
  the recommended max bid, since you can never win below the current bid,
- for Copart listings, the actual buyer-side fees using the tiered schedule
  in `src/data/copartFees.js` (buyer fee tier + internet bid fee + gate fee
  + environmental fee + title fee); other auction houses (IAAI, Manheim,
  Cars & Bids, Bring a Trailer) don't have their fee schedules modeled yet
  and fall back to a flat 10% estimate,
- shipping to the UAE (RoRo estimate) + 5% UAE customs duty + 5% VAT on the
  duty-inclusive value + reconditioning/retitle costs for any reported
  damage or non-clean title,
- an indicative UAE clean resale value (using heuristic per-model UAE
  demand multipliers in `src/data/uaeMarketAdjustments.js`, not live market
  data),
- the resulting profit in USD and AED (AED figures use the UAE's fixed USD
  peg of 3.6725), and
- a `status` of `profitable`, `marginal`, or `not-profitable`.

**Caveats:** the Copart fee tiers are reconstructed from public third-party
fee calculators, not Copart's authoritative member fee schedule (which
varies by membership tier/location and requires a login to view exactly).
The UAE demand multipliers and resale values are heuristic, not live market
comps. Swap in real Copart account fees, other auction houses' fee
schedules, and live UAE market data (e.g. dubizzle/DubiCars listings for
the same make/model/year) for production use.

### Tests

```bash
npm test
```
