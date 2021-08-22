import { interval } from "@giveback007/util-lib";
import { test } from "@buckleup/common";
import express = require('express');
import cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json('it works')
})

test();

interval((i) => console.log(i + 1), 1500, 5);

app.listen(4000, () => {
    console.log("Listening");
});
