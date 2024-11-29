import hkpost from '../src/hkpost.mjs';
import {AxiosError} from "axios";

describe('hkpost', () => {

    it('getStreetAddress', async () => {
        try {
            const output = await hkpost.getStreetAddress({
                street: "QUEENSWAY",
                key: "UNITED CENTRE"
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
                building: "MEI SHEK HOUSE",
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
});
