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

const isProd = nodeEnv === "production";

const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', "test", 'production'], default: 'development' }),
    PORT: port({ default:3000 }),
    MONGO_URI: str({
        default: isProd ? undefined : "mongodb://127.0.0.1:27017/taxigo_test",
    }),
    JWT_SECRET: str({
        default: isProd ? undefined : "test_jwt_secret_do_not_use_in_prod",
    }),
});

process.env.NODE_ENV = env.NODE_ENV;
process.env.PORT = String(env.PORT);
process.env.MONGO_URI = env.MONGO_URI;
process.env.JWT_SECRET = env.JWT_SECRET;

module.exports = env;
