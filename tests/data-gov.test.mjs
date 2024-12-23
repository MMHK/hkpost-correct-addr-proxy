import {AxiosError} from "axios";
import datagovhk from "../src/data-gov-hk.mjs";

describe('data-gov-hk', () => {

    it('lookup', async () => {
        try {
            const output = await datagovhk.lookup(process.env.TEST_GOV_LOOKUP_ADDR);
            console.dir(JSON.stringify(output, null, "   "));
        } catch (e) {
            if (e instanceof AxiosError) {
                console.error(e.message);
                return;
            }
            console.error(e);
        }

    }, 60000);


    // it('searchAddress', async () => {
    //     try {
    //         const output = await datagovhk.searchAddress({
    //             building: "TOWER 2 DRAGONS RANGE COURT C",
    //             street: "LAI PING ROAD",
    //             estate: "KAU TO SHAN",
    //         });
    //         console.info(output);
    //     } catch (e) {
    //         if (e instanceof AxiosError) {
    //             console.error(e.message);
    //             return;
    //         }
    //         console.error(e);
    //     }
    //
    // }, 60000);
});
