const mongoose = require('mongoose');

/**Connect to the mongodb */
mongoose.connect('mongodb://127.0.0.1:27017/TaxiGo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})