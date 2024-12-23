import hkpost from '../src/hkpost.mjs';
import {AxiosError} from "axios";
import {
    readCSVToArray,
    workflow,
} from "./common.mjs";

describe('hkpost', () => {

    it('getStreetAddress', async () => {
        try {
            const output = await hkpost.getStreetAddress({
                street: "Ng Ka Tsuen",
                key: "29"
            });
            console.info(output);
        } catch (e) {
            if (e instanceof AxiosError) {
                console.error(e.message);
                return;
            }
            console.error(e);
        }

    }, 60000);

    it('getBuildingAddress', async () => {
        try {
            const output = await hkpost.getBuildingAddress({
                building: "YUEN LENG VILLAGE",
            });
            console.info(output);
        } catch (e) {
            if (e instanceof AxiosError) {
                console.error(e.message);
                return;
            }
            console.error(e);
        }

    }, 60000);


    it('multiple-records', async () => {
        const csvPath = process.env.TEST_CSV_PATH;
        let records = await readCSVToArray(csvPath);
        records = records.slice(11); // 截取前10个记录
        // console.log(records);

        for (let row of records) {
            const address = row.addr;
            let result = await workflow(address);
            if (result.status != "true") {
                console.log(`order_id: ${row.order_id} result: ${JSON.stringify(result.result)}`);
            }

            // console.log(result);
        }

    }, 600000000)
});
