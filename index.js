import dotenv from 'dotenv';
dotenv.config();

import(/* webpackMode: "eager" */"./src/server.mjs")
    .then(({ StartService }) => {
        StartService();
    });

