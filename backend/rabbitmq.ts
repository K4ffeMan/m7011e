import { voteConsume } from "./rmq-consumer/consumer";
import { videoConsume } from "./rmq-consumer/video_consumer";

async function startRabbit(){
    (async () => {
        while(true){
            try{
                console.log("vote c started")
                await voteConsume();
                break;
            }catch(err){
                console.error("vote consumer failed")
            }
            await new Promise(r => setTimeout(r, 4000));
        }
    })();

    (async () => {
        while(true){
            try{
                console.log("video c started")
                await videoConsume();
                break;
            }catch(err){
                console.error("video consumer failed")
            }
            await new Promise(r => setTimeout(r, 4000));
        }
    })();
    
}

startRabbit();