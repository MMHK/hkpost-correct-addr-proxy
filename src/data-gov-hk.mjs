import axios from 'axios';

const API_ENDPOINT =  process.env.DATA_GOV_HK_ENDPOINT || "https://www.als.ogcio.gov.hk";
const GEO_API_ENDPOINT =  process.env.GEO_GOV_HK_ENDPOINT || "https://geodata.gov.hk/gs/api/v1.0.0";

function scoreStrings(words, string2) {
    // 計算每個單詞在 string2 中出現的次數
    return words.reduce((count, word) => {
        const regex = new RegExp(`(${word})`, 'ig');
        const occurrences = (string2.match(regex) || []).length;
        return count + occurrences;
    }, 0);
}

function transformAddress(inputJson) {
    let addr_block_no = inputJson.Address.PremisesAddress.EngPremisesAddress.EngBlock?.BlockNo || "";
    let addr_block = inputJson.Address.PremisesAddress.EngPremisesAddress.EngBlock?.BlockName || "";
    if (addr_block_no) {
        addr_block = `${addr_block} ${addr_block_no}`;
    }
    let addr_st_no_from = inputJson.Address.PremisesAddress.EngPremisesAddress.EngStreet?.BuildingNoFrom || "";
    let addr_st_no_to = inputJson.Address.PremisesAddress.EngPremisesAddress.EngStreet?.BuildingNoTo || "";
    if (addr_st_no_to && addr_st_no_from) {
        addr_st_no_from = `${addr_st_no_from}-${addr_st_no_to}}`;
    }
    let addr_district = inputJson.Address.PremisesAddress.EngPremisesAddress.EngDistrict?.DcDistrict || "";

    return {
        addr_block: addr_block,
        addr_bldg: inputJson.Address.PremisesAddress.EngPremisesAddress.BuildingName || "",
        addr_st_no: addr_st_no_from,
        addr_st_name: inputJson.Address.PremisesAddress.EngPremisesAddress.EngStreet?.StreetName || "",
        addr_estate: inputJson.Address.PremisesAddress.EngPremisesAddress.EngEstate?.EstateName || "",
        addr_district: addr_district.replace(/( DISTRICT)$/i, ""),
        score: inputJson.ValidationInformation?.Score || 0
    };
}

export default {
    /**
     *
     * @param {string} query
     * @param {number} limit
     * @returns {Promise<void>}
     */
    async lookup(query, limit = 20) {

        const search = new URLSearchParams();
        search.append('q', query);
        search.append('n', limit);

        const resp = await axios.get(`${API_ENDPOINT}/lookup?${search.toString()}`, {
            headers: {
                Accept: "application/json",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari",
            }
        });
        const suggestions = resp.data?.SuggestedAddress || [];

        return suggestions.map((row) => {
            return transformAddress(row);
        }).filter(row => row.score >= 50);
    },

    async locationSearch(query) {
        const search = new URLSearchParams();
        search.append('q', query);

        const resp = await axios.get(`${GEO_API_ENDPOINT}/locationSearch?${search.toString()}`, {
            headers: {
                Accept: "application/json",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari",
            }
        });
        const addressList = resp.data || [];
        return addressList.map(row => {
            return {
                address: row.addressEN,
                district: row.districtEN,
                name: row.nameEN,
            }
        })
    },
}
