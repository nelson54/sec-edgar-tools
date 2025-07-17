const fs = require('node:fs/promises');

const createClient = require("redis").createClient;

const secTickersUrl = 'https://www.sec.gov/files/company_tickers.json'

async function loadAllStocks() {
    console.info("Connecting to local redis")
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

    let companies = []
    try {
        const companyTickers = await fs.readFile('./company_tickers.json', { encoding: 'utf8' });
        companies = Object.values(JSON.parse(companyTickers))
        console.dir(companies)
    } catch (e) {
        console.dir(e)
    }

    for (let [_, stock] of companies.entries()) {
        await storeStock(client, stock)
    }

    client.destroy();
}

async function storeStock(client, stock) {
    console.log(`storing ${stock.ticker}`)

    return client.hSet('stocks', stock.ticker, JSON.stringify(stock));
}

(async ()=> loadAllStocks())()