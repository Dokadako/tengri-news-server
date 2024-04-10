const express = require('express');
const mongoose = require('mongoose');
const articleRoutes = require('./routes/articles');
const cors = require('cors');
const mongodbUri = "mongodb+srv://admin:salam@tengri-new.3wqggyt.mongodb.net/?retryWrites=true&w=majority&appName=tengri-new";
const morgan = require('morgan');


const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: err.message});
});

app.use('/uploads', express.static('uploads'));
app.use('/api/articles', articleRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
