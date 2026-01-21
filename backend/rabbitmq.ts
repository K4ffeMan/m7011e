import { voteConsume } from "./rmq-consumer/consumer";
import { videoConsume } from "./rmq-consumer/video_consumer";

async function startRabbit(){
    voteConsume();
    videoConsume();   
}

startRabbit();