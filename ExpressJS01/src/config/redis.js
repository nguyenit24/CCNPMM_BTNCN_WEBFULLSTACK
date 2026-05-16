let RedisClient = null;

try {
    RedisClient = require('ioredis');
} catch (error) {
    RedisClient = null;
}

const memoryStore = new Map();

const getMemoryRecord = (key) => {
    const entry = memoryStore.get(key);
    if (!entry) {
        return null;
    }

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        memoryStore.delete(key);
        return null;
    }

    return entry.value;
};

const memoryClient = {
    async set(key, value, mode, ttlSeconds) {
        const ttl = mode === 'EX' ? Number(ttlSeconds) || 0 : 0;
        const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;
        memoryStore.set(key, { value, expiresAt });
        return 'OK';
    },
    async get(key) {
        return getMemoryRecord(key);
    },
    async del(key) {
        return memoryStore.delete(key) ? 1 : 0;
    },
};

const createRedisClient = () => {
    if (!RedisClient) {
        return {
            ...memoryClient,
            mode: 'memory',
            raw: null,
        };
    }

    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const client = new RedisClient(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
    });


    const safeCall = async (method, ...args) => {
        try {
            return await client[method](...args);
        } catch (error) {
            if (method === 'set') {
                return memoryClient.set(...args);
            }
            if (method === 'get') {
                return memoryClient.get(...args);
            }
            if (method === 'del') {
                return memoryClient.del(...args);
            }
            throw error;
        }
    };

    return {
        set: (key, value, mode, ttlSeconds) => safeCall('set', key, value, mode, ttlSeconds),
        get: (key) => safeCall('get', key),
        del: (key) => safeCall('del', key),
        raw: client,
        mode: 'redis',
    };
};

const checkRedisConnection = async () => {
    const client = createRedisClient();

    if (client.mode === 'memory' || !client.raw) {
        return {
            connected: false,
            mode: 'memory',
            message: 'ioredis không khả dụng, đang dùng memory fallback',
        };
    }

    try {
        if (client.raw.status === 'wait' || client.raw.status === 'end') {
            await client.raw.connect();
        }

        const pong = await client.raw.ping();
        return {
            connected: pong === 'PONG',
            mode: 'redis',
            message: pong === 'PONG' ? 'Redis connected' : 'Redis ping failed',
        };
    } catch (error) {
        return {
            connected: false,
            mode: 'redis',
            message: error.message || 'Redis connection failed',
        };
    }
};

module.exports = {
    createRedisClient,
    checkRedisConnection,
};
