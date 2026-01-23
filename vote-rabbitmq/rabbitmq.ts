import { voteConsume } from "./vote_consumer";

async function startRabbit(){
    voteConsume();   
}

startRabbit();