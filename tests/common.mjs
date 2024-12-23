import fs from "fs";
import csv from "csv-parser";
import {CompletionClient} from "dify-client";
import {v4} from "uuid";

const UUID = () => {
    return `${v4()}`;
}

const readCSVToArray = (csvPath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

const workflow = async (address = '', company_id = '11') => {
    const difyClient = new CompletionClient(process.env.DIFY_API_KEY, process.env.DIFY_API_URL);

    const response = await difyClient.runWorkflow({
        addressLine: address,
        company_id,
    }, UUID(), false);

    return response.data.data?.outputs || {};
}

export {
    readCSVToArray,
    workflow,
};


