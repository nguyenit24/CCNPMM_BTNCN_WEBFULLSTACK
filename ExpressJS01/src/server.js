const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`);

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    require('dotenv').config();
}

const express = require('express');
const configViewEngine = require('./config/viewEngine');
const connection = require('./config/database');
const apiRoutes = require('./routes/api');
const { getHomepage } = require('./controllers/homeController');
const cors = require('cors');
const { checkRedisConnection } = require('./config/redis');

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

app.use('/v1/api/', apiRoutes);

(async () => {
    try {
        await connection();

        // Check Redis connection: if REDIS_URL is set and Redis fails, stop startup so Docker Redis can be fixed.
        const redisStatus = await checkRedisConnection();
        console.log(`Redis status: ${redisStatus.message}`);

        const redisConfigured = Boolean(process.env.REDIS_URL);
        if (redisConfigured && redisStatus.mode === 'redis' && !redisStatus.connected) {
            console.error('Redis appears configured (REDIS_URL set) but connection failed. Ensure Docker Redis is running (e.g. `docker run -d --name redis -p 6379:6379 redis:7`).');
            process.exit(1);
        }

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log(">>> Error connect to DB: ", error);
    }
})();