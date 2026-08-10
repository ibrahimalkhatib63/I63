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

Each result includes which auction house it's listed in, the current bid,
and a `pricing` object with the estimated fair market value, a recommended
maximum bid, and a full breakdown of how it was calculated.

### Tests

```bash
npm test
```
