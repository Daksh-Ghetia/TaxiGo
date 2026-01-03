/* Get all the node modules required */
const express = require('express');
const cors = require('cors');
const http = require('http');

// Load the environment variables before starting anything else.
const env = require('./config/env');
const connectDB = require('./db/mongoose');

/* Get all the routers */
const adminRouter = require('./routers/authenticate');
const vehicleTypeRouter = require('./routers/vehicleType');
const countryRouter = require('./routers/country');
const cityRouter = require('./routers/city');
const vehiclePricingRouter = require('./routers/vehiclePricing');
const userRouter = require('./routers/user');
const driverRouter = require('./routers/driver');
const rideRouter = require('./routers/ride');
const socketIo = require('./routers/socket-io');
const settingRouter = require('./routers/setting');
const feedbackRouter = require('./routers/feedback');

const PORT = env.PORT;
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
app.use(rideRouter);
app.use(settingRouter);
app.use(feedbackRouter);

const server = http.createServer(app);

require('socket.io')(server, {
    cors: { origin: '*' },
});
socketIo.socket(server);

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server failed to start:', error);
        process.exit(1);
    }
};

startServer();