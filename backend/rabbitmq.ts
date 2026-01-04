import { voteConsume } from "./rmq-consumer/consumer";
import { videoConsume } from "./rmq-consumer/video_consumer";

async function startRabbit(){
    try{
        await voteConsume();
        await videoConsume();
    }catch(err){
        console.error("Rabbitmq failed");
        process.exit(1);
    }
}

startRabbit();