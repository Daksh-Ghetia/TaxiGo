const path = require('path');
const dotenv = require('dotenv');
const { cleanEnv, str, port } = require('envalid');

/* Load env file according to development or production environment.
*       Get the environment
*       Get the file according to environment
*       Load the file
* */
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({
    path: path.resolve(process.cwd(), envFile),
});
console.log(`Environment: ${process.env.NODE_ENV}`);

const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'], default: 'development' }),
    PORT: port({ default:3000 }),
    MONGO_URI: str(),
    JWT_SECRET: str(),
});

module.exports = env;
