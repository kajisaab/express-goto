import { createClient } from 'redis';
import type { RedisClientType, RedisClientOptions, RedisDefaultModules, RedisFunctions, RedisModules, RedisScripts } from 'redis';
import { AppLogger } from '../logger';

export class CacheFactory {
    private static instance: CacheFactory;
    private client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts> | null = null;
    private connecting: Promise<RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>> | null = null;
    private initialized = false;
    private logger: AppLogger = new AppLogger();
    private redisUrl: string = '';

    public constructor() {
        // Private constructor to enforce singleton pattern;
        this.redisUrl = process.env.REDIS_URL || '';
    }

    /**
     * Get the singleton instance of CacheFactory
     */
    public static getInstance(): CacheFactory {
        if (!CacheFactory.instance) {
            CacheFactory.instance = new CacheFactory();
        }
        return CacheFactory.instance;
    }

    /**
     * Initialize the Redis connection
     * Call this during application startup
     */
    public async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await this.getOrCreateCacheClient();
            this.initialized = true;
        } catch (error) {
            this.logger.error(`Failed to initialize Redis client: ${error}`);
            throw error; // Re-throw to allow the app to handle connection failures
        }
    }

    /**
     * Get or create the Redis client
     */
    private async getOrCreateCacheClient(): Promise<RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>> {
        if (this.client) {
            return this.client;
        }

        // If a connection is in progress, return that promise
        if (this.connecting) {
            return this.connecting;
        }

        // Create a new connection
        this.connecting = this.createCacheClient();
        this.client = await this.connecting;
        this.connecting = null;

        return this.client;
    }

    /**
     * Create and connect to Redis
     */
    private async createCacheClient(): Promise<RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>> {
        const redisConfigOptions: RedisClientOptions = {
            url: this.redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    // Maximum retry delay (15 seconds)
                    const maxRetryDelay = 15000;
                    // Exponential backoff
                    return Math.min(retries * 100, maxRetryDelay);
                },
            },
        };

        // Using createClient directly instead of redis.createClient
        const client = createClient(redisConfigOptions);

        // Set up event handlers
        client.on('error', (err) => {
            this.logger.error(`Redis Client Error: ${err}`);
        });

        client.on('reconnecting', () => {
            this.logger.log('Redis client attempting to reconnect');
        });

        client.on('ready', () => {
            this.logger.log('✅ Redis client initialized successfully');
        });

        // Connect to Redis
        await client.connect();

        return client;
    }

    /**
     * Store data in Redis cache
     */
    public async cacheData(key: string, data: unknown, config?: { ttl?: number; max?: number }): Promise<void> {
        const redisClient = await this.getOrCreateCacheClient();

        if (config?.ttl) {
            // TTL is set → use setEx (sets expiry)
            await redisClient.setEx(key, config.ttl, JSON.stringify(data));
        } else {
            // No TTL → persist indefinitely
            await redisClient.set(key, JSON.stringify(data));
        }
    }

    /**
     * Store the multiple data on the single key.
     */
    public async cacheSetData(key: string, data: string | string[] | object[]): Promise<void> {
        const redisClient = await this.getOrCreateCacheClient();

        let members: string[] = [data as string];

        if (Array.isArray(data)) {
            // If data contains objects, we need to stringify them
            members = data.map((item) => (typeof item === 'object' ? JSON.stringify(item) : item));
        }
        // Add the key as the first argument, followed by the set members
        await redisClient.sAdd(key, members);
    }

    /**
     * Retrieves all members from a Redis set
     * @param key The Redis key for the set
     */
    public async getCachedSetData(key: string): Promise<string[]> {
        const redisClient = await this.getOrCreateCacheClient();
        return redisClient.sMembers(key);
    }

    /**
     * Set the expiresIn separately.
     * @param key The Redis key for the value
     * @param ttl The time to live in second.
     */
    public async setContinually(key: string, ttl: number): Promise<void> {
        const redisClient = await this.getOrCreateCacheClient();
        await redisClient.expire(key, ttl);
    }

    /**
     * Retrieve data from Redis cache
     */
    public async getCachedData<T>(key: string): Promise<T | null> {
        const redisClient = await this.getOrCreateCacheClient();
        const data = await redisClient.get(key);

        if (!data) return null;

        try {
            return JSON.parse(data) as T;
        } catch (error) {
            this.logger.error(`Error parsing cached data: ${error}`);
            return null;
        }
    }

    /**
     * Delete an item from cache
     */
    public async deleteCachedData(key: string): Promise<void> {
        const redisClient = await this.getOrCreateCacheClient();
        await redisClient.del(key);
    }

    /**
     * Disconnect the Redis client
     */
    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.disconnect();
            this.client = null;
            this.initialized = false;
        }
    }
}
