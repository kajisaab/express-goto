import { Kafka, Producer, Consumer, EachMessagePayload, logLevel, Partitioners } from 'kafkajs';
import { AppLogger } from '../logger';

export class KafkaService {
    private static instance: KafkaService;
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;
    private logger: AppLogger = new AppLogger();
    private isConnected: boolean = false;

    private constructor() {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || 'my-kafka-client',
            brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['kafka1:29092', 'kafka2:29092'],
            logLevel: logLevel.INFO,
            // Add connection timeout and retry settings
            connectionTimeout: 10000,
            requestTimeout: 30000,
            retry: {
                initialRetryTime: 1000,
                retries: 5,
                maxRetryTime: 30000,
                factor: 2,
            },
        });

        this.producer = this.kafka.producer({
            allowAutoTopicCreation: true,
            createPartitioner: Partitioners.DefaultPartitioner,
            // Add producer retry settings
            retry: {
                initialRetryTime: 1000,
                retries: 5,
                maxRetryTime: 30000,
            },
        });

        this.consumer = this.kafka.consumer({
            groupId: process.env.KAFKA_CONSUMER_GROUP || 'my-group',
            // Add consumer settings for better reliability
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
            maxWaitTimeInMs: 5000,
            retry: {
                initialRetryTime: 1000,
                retries: 5,
                maxRetryTime: 30000,
            },
        });
    }

    public static getInstance(): KafkaService {
        if (!KafkaService.instance) {
            KafkaService.instance = new KafkaService();
        }
        return KafkaService.instance;
    }

    // Method to wait for Kafka cluster to be ready
    private async waitForKafkaCluster(maxRetries: number = 10): Promise<void> {
        const admin = this.kafka.admin();

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await admin.connect();
                const metadata = await admin.fetchTopicMetadata();
                await admin.disconnect();

                this.logger.log(`✅ Kafka cluster is ready (attempt ${attempt})`);
                return;
            } catch (error) {
                this.logger.error(`❌ Kafka cluster not ready (attempt ${attempt}/${maxRetries}): ${error}`);

                if (attempt === maxRetries) {
                    throw new Error(`Kafka cluster not ready after ${maxRetries} attempts`);
                }

                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }

    // Method to ensure topic exists
    private async ensureTopicExists(topic: string): Promise<void> {
        const admin = this.kafka.admin();

        try {
            await admin.connect();

            const topics = await admin.listTopics();
            if (!topics.includes(topic)) {
                this.logger.log(`📝 Creating topic: ${topic}`);
                await admin.createTopics({
                    topics: [
                        {
                            topic,
                            numPartitions: 3,
                            replicationFactor: 2,
                        },
                    ],
                });
                this.logger.log(`✅ Topic created: ${topic}`);
            } else {
                this.logger.log(`✅ Topic already exists: ${topic}`);
            }
        } catch (error) {
            this.logger.error(`❌ Failed to ensure topic exists: ${error}`);
            throw error;
        } finally {
            await admin.disconnect();
        }
    }

    public async connectProducer(): Promise<void> {
        try {
            // Wait for Kafka cluster to be ready first
            await this.waitForKafkaCluster();

            await this.producer.connect();
            this.isConnected = true;
            this.logger.log('✅ Kafka producer connected');
        } catch (err) {
            this.logger.error(`❌ Kafka producer connection failed: ${err}`);
            throw err;
        }
    }

    public async connectConsumer(topic: string, fromBeginning: boolean = false, messageHandler: (payload: EachMessagePayload) => Promise<void>): Promise<void> {
        try {
            // Wait for Kafka cluster to be ready first
            await this.waitForKafkaCluster();

            // Ensure the topic exists before trying to consume
            await this.ensureTopicExists(topic);

            // Add a delay to ensure group coordinator is ready
            this.logger.log('⏳ Waiting for group coordinator to be ready...');
            await new Promise((resolve) => setTimeout(resolve, 10000));

            await this.consumer.connect();
            await this.consumer.subscribe({ topic, fromBeginning });

            await this.consumer.run({
                eachMessage: async (payload) => {
                    try {
                        await messageHandler(payload);
                    } catch (error) {
                        this.logger.error(`❌ Error processing message: ${error}`);
                        // Don't throw here to avoid stopping the consumer
                    }
                },
            });

            this.logger.log(`✅ Kafka consumer connected and subscribed to ${topic}`);
        } catch (err) {
            this.logger.error(`❌ Kafka consumer connection failed: ${err}`);
            throw err;
        }
    }

    public async sendMessage(topic: string, messages: { key?: string; value: string } | { key?: string; value: string }[]): Promise<void> {
        if (!this.isConnected) {
            throw new Error('Producer is not connected. Call connectProducer() first.');
        }

        try {
            // Ensure topic exists before sending
            await this.ensureTopicExists(topic);

            const result = await this.producer.send({
                topic,
                messages: !Array.isArray(messages)
                    ? [{ key: messages.key || null, value: messages.value }]
                    : messages.map((m) => ({
                          key: m.key || null,
                          value: m.value,
                      })),
            });

            this.logger.log(`📤 Message sent to ${topic}`);
        } catch (err) {
            this.logger.error(`❌ Failed to send message: ${err}`);
            throw err;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.producer) {
                await this.producer.disconnect();
            }
            if (this.consumer) {
                await this.consumer.disconnect();
            }
            this.isConnected = false;
            this.logger.log('🔌 Kafka disconnected');
        } catch (error) {
            this.logger.error(`❌ Error during disconnect: ${error}`);
        }
    }

    // Health check method
    public async healthCheck(): Promise<boolean> {
        try {
            const admin = this.kafka.admin();
            await admin.connect();
            await admin.listTopics();
            await admin.disconnect();
            return true;
        } catch (error) {
            this.logger.error(`❌ Kafka health check failed: ${error}`);
            return false;
        }
    }
}
