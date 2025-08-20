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
        let position = 1;
        for (let batch of batches) {
            let progress = Math.round((position/batches.length) * 100);

            console.log(`Processing batch ${position} of ${batches.length} \n${progress}% complete`);
            await processStockBatch(client, batch)

            position++;
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
    console.log('Processing batch')
    console.dir(batch)

    for ( let ticker of batch) {
        try {
            await readAndStoreTicker(client, ticker)
        } catch (e) {
            // console.log(`Unable to process symbol: ${ticker}`)
            await client.del(`reports:${ticker}`)

        }
    }

    console.log(`Delaying for 1 second`)
    return delay(1000)
}

async function readAndStoreTicker(client, ticker) {
    const reports = await secEdgarApi.getReports({symbol: ticker})
    //console.dir(report)

    for(let i = 0; i < reports.length; i++) {
        let report = reports[i]
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