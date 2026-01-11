import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({
    name: envVars.REDIS.REDIS_USERNAME,
    password: envVars.REDIS.REDIS_PASSWORD,
    socket: {
        host: envVars.REDIS.REDIS_HOST,
        port: Number(envVars.REDIS.REDIS_PORT)
    }
});

redisClient.on('error', error => console.log('Redis Client Error:', error));

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        redisClient.connect();
        console.log("Redis Connected!");
    }
}
