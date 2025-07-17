const fs = require("node:fs/promises");
const createClient = require("redis").createClient;
const secEdgarApi = require('sec-edgar-api').secEdgarApi

async function loadAll10Ks() {
    console.info("Connecting to local redis")
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

    const tickers = await client.hKeys("stocks")

    try {
        const batches = chunkArray(tickers, 10)

        for (let batch of batches) {
            await processStockBatch(client, batch)
        }
    } catch (e) {
        console.dir(e)
    }


    client.destroy();
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processStockBatch(client, batch) {
    console.log('processing batch')
    console.dir(batch)

    for ( let ticker of batch) {
        try {
            await readAndStoreTicker(client, ticker)
        } catch (e) {
            console.log(`Unable to process symbol: ${ticker}`)
        }
    }

    console.log(`Delaying for 1 second`)
    return delay(1000)
}

async function readAndStoreTicker(client, ticker) {
    const reports = await secEdgarApi.getReports({symbol: ticker})
    //console.dir(report)

    for(let report of reports) {
        await client.hSet(`reports:${ticker}`, `${report.fiscalYear}:${report.fiscalPeriod}`, JSON.stringify(report));
    }
}

function chunkArray(arr, chunkSize = 10) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}


(async ()=> loadAll10Ks())()