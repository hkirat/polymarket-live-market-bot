// https://clob.polymarket.com
// wss://ws-live-data.polymarket.com
// {"action":"subscribe","subscriptions":[{"topic":"crypto_prices_chainlink","type":"update","filters":"{\"symbol\":\"btc/usd\"}"}]}
import { ClobClient, Side } from "@polymarket/clob-client";
import { Wallet } from "ethers"; // v5.8.0

const wallet = new Wallet(process.env.PRIVATE_KEY!);
const POLYMARKET_DATA_STREAM_URL = "wss://ws-live-data.polymarket.com"
const MARKET = "btc/usd"
const POLYMARKET_CURRENT_MARKET_ID = "btc-updown-5m-1772566500";
const RANDOM_START_TIME_S = 1772568900;

const client = new ClobClient(
  "https://clob.polymarket.com",
  137, // Polygon mainnet
  wallet
);

let lastMarketEndPrice = 0;
let lastActiveMarketId: null | string = null ;
let orderPlacedForMarket: {[key: string]: boolean} = {};

function createOrderForMarket(marketId: string, side: Side, price: number, size){
    return client.createOrder({
        tokenID: marketId,
        side,
        price,
        size
    })
}

const ws = new WebSocket(POLYMARKET_DATA_STREAM_URL);
ws.onopen = () => {
    console.log("connected");
    console.log(`{"action":"subscribe","subscriptions":[{"topic":"crypto_prices_chainlink","type":"update","filters":"{\\"symbol\\":\\"${MARKET}\\"}"}]}`)
    ws.send(`{"action":"subscribe","subscriptions":[{"topic":"crypto_prices_chainlink","type":"update","filters":"{\\"symbol\\":\\"${MARKET}\\"}"}]}`)
}

ws.onmessage = (data) => {
    if (!data.data) {
        return;
    }
    const json = JSON.parse(data.data);
    const value = json.payload.value;
    console.log(value)
    // createOrderForMarket
    const timePassed = Math.floor(((Date.now() - (new Date(1772544600000).getTime())) % 300000) / 1000);
    const timeLeft = 300 - timePassed;
    const currentActiveMarketId = `btc-updown-5m-` + Number(RANDOM_START_TIME_S + 300 * Math.floor((Math.floor(Date.now() / 1000) - RANDOM_START_TIME_S) / 300));

    if (!lastActiveMarketId) {
        lastActiveMarketId = currentActiveMarketId;
    }

    if (currentActiveMarketId !== lastActiveMarketId) {
        // Scope of imporove ment here
        lastActiveMarketId = currentActiveMarketId;
        lastMarketEndPrice = value;
    }

    console.log(RANDOM_START_TIME_S);
    console.log(Math.floor((Math.floor(Date.now() / 1000) - RANDOM_START_TIME_S) / 300))

    console.log(currentActiveMarketId);
    console.log(currentActiveMarketId);

    console.log(timeLeft);
    console.log(timePassed);
    console.log("price to beat is " + lastMarketEndPrice);

    if (timeLeft <= 30 && lastMarketEndPrice && !orderPlacedForMarket[currentActiveMarketId]) {
        orderPlacedForMarket[currentActiveMarketId] = true;
        if ((lastMarketEndPrice - value) < 100) {
            console.log("place buy order")
        }
        
        if ((lastMarketEndPrice - value) > 100) {
            console.log("place sell order")
        }
        
    }
}