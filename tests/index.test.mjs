import hkpost from '../src/hkpost.mjs';
import {AxiosError} from "axios";

describe('hkpost', () => {

    it('correctAddressing', async () => {
        try {
            const output = await hkpost.correctAddressing({
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
});
