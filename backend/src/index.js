const express = require('express');
require('./db/mongoose')
const cors = require('cors');
const adminRouter = require('./routers/authenticate');
const vehicleTypeRouter = require('./routers/vehicleType');
const countryRouter = require('./routers/country');
const cityRouter = require('./routers/city');
const vehiclePricingRouter = require('./routers/vehiclePricing');
const userRouter = require('./routers/user');
const driverRouter = require('./routers/driver');


const settingRouter = require('./routers/setting');

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.static('public'));

app.use(adminRouter);
app.use(vehicleTypeRouter);
app.use(countryRouter);
app.use(cityRouter);
app.use(vehiclePricingRouter);
app.use(userRouter);
app.use(driverRouter);


app.use(settingRouter)

app.listen(3000, () => {
    console.log("port up on 3000");
})