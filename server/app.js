const express = require('express');
const app = express();
const port = 7000 || process.env.PORT;
const clientRouter = require('./routes/Client');
const cors = require('cors');

app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: 'alive' });
});

app.use(express.json());
// app.use('/quotes', quotesRouter);
app.use('/Client', clientRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
