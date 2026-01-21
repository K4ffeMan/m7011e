import client from "prom-client";
import { voteConsume } from "./rmq-consumer/consumer";
import { videoConsume } from "./rmq-consumer/video_consumer";

export const rabbitmq_messages_rejected = new client.Counter({
    name: 'rabbitmq_messages_rejected',
    help: 'Rabbitmq messages rejected',
    labelNames: ['action', 'service']
});

async function startRabbit(){
    voteConsume();
    videoConsume();
    
}

startRabbit();