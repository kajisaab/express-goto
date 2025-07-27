import { EachMessagePayload } from 'kafkajs';
import { KafkaService } from '../kafka';

export class UserActivationConsumer {
    private kafkaService: KafkaService;

    constructor() {
        this.kafkaService = KafkaService.getInstance();
        this.initConsumer();
    }

    private async initConsumer() {
        await this.kafkaService.connectConsumer('user-activation-topic', true, async (payload: EachMessagePayload) => {
            // Business logic for user activation
            const { message, partition, topic } = payload;
            const value = message.value?.toString();
            // Example: Log and process the message
            console.log(`Received message on ${topic} partition ${partition}:`, value);
            // TODO: Add your business logic here
        });
    }
}
