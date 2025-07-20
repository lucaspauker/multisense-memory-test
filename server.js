const express = require('express');
const path = require('path');

const app = express();
const port = 7777;

app.use(express.static('.'));

app.listen(port, () => {
  console.log(`Memory test app running at http://localhost:${port}`);
});