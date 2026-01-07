import { castVote } from "../db/votes";
import { getChannel } from "../rabbitmq/producer";

const AMQP_URL = process.env.AMQP_URL!;

export async function voteConsume(){
    const channel = await getChannel();

    await channel.assertQueue("votes", {durable: true});
    
    await channel.prefetch(5);
    

    console.log("vote consumer started")
    channel.consume(
        "votes",
        async (msg) => {
            if(!msg){
                return;
            }
            try{
                const incom = JSON.parse(msg.content.toString());
                console.log("adding vdieo")
                await castVote(incom.roomId, incom.videoId, incom.userId);
                console.log("added video")
                channel.ack(msg);
                
            }catch{
                channel.nack(msg, false, false);
            }
        }
    )
}
