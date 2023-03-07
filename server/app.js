const express = require('express');
const app = express();
const port = 7000 || process.env.PORT;
const clientRouter = require('./routes/Client');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'alive' });
});

app.use('/Client', clientRouter);
app.use('/Client/:id_acc', clientRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
