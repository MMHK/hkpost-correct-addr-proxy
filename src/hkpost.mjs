import axios from 'axios';
import {load as cheerioLoad } from 'cheerio';

const API_ENDPOINT =  process.env.API_ENDPOINT || "https://webapp.hongkongpost.hk/correct_addressing";

function tableToJson(body, tableSelector) {
    const $ = cheerioLoad(body);

    const json = [];
    const headers = [];

    // 獲取表頭
    $(tableSelector).find('th').each((i, elem) => {
        headers.push($(elem).text().trim().replace("null", ""));
    });

    // 獲取每一行數據
    $(tableSelector).find('tr').each((i, elem) => {
        if (i !== 0) { // 跳過表頭行
            const row = {};
            $(elem).find('td').each((j, cell) => {
                const key = headers[j];
                const rule = /\(([^)]+)\)/i
                const val = $(cell).text().trim() || "";
                const matches = rule.exec(val);
                if (matches) {
                    row[`${key}-en`] = val.replace(rule, '').trim();
                    row[`${key}-zh`] = (matches[1] || "").trim();
                }
            });
            json.push(row);
        }
    });

    return json.filter(row => row)
        .map((row) => {
            return Object.fromEntries(Object.entries(row).filter(([k, v]) => {
                return k;
            }))
        }).filter((row) => {
            return Object.keys(row).length > 0;
        });
}

function scoreStrings(words, string2) {
    // 計算每個單詞在 string2 中出現的次數
    return words.reduce((count, word) => {
        const regex = new RegExp(`(${word})`, 'ig');
        const occurrences = (string2.match(regex) || []).length;
        return count + occurrences;
    }, 0);
}

export default {
    scoreStrings,

    async getBuildingAddress(opt = {
        building: ""
    }) {
        const query = {
            iseng: "true",
            n: 4,
            a: 1,
            currpage: 1,
            lang1: "en",
            ...opt,
        };

        const search = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => {
            search.append(k, v);
        })

        const resp  = await axios.get(`${API_ENDPOINT}/GetBuildingAddr.jsp?${search.toString()}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari",
            }
        });
        let body = resp.data || "";
        return tableToJson(body, ".tableb");
    },

    async getStreetAddress(opt = {
        street: "",
        key: ""
    }) {
        const query = {
            iseng: "true",
            n: 50,
            a: 1,
            currpage: 1,
            lang1: "en",
            ...opt,
        };

        const search = new URLSearchParams();
        Object.entries(query).forEach(([k, v]) => {
            search.append(k, v);
        })

        const resp  = await axios.get(`${API_ENDPOINT}/GetStreetAddr.jsp?${search.toString()}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari",
            }
        });
        let body = resp.data || "";
        return tableToJson(body, ".tables");
    }
}
