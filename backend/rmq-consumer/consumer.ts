import amqp from "amqplib";
import { castVote } from "../db/votes";

const AMQP_URL = process.env.AMQP_URL!;

export async function voteConsume(){
    const connection = await amqp.connect(AMQP_URL);
    
    const channel = await connection.createChannel();

    await channel.assertQueue("votes", {durable: true});
    
    await channel.prefetch(1);
    

    channel.consume(
        "votes",
        async (msg) => {
            if(!msg){
                return;
            }
            try{
                const incom = JSON.parse(msg.content.toString());

                await castVote(incom.roomId, incom.videoId, incom.userId);

                channel.ack(msg);
            }catch{
                console.error("Failed to consume");
                channel.nack(msg, false, true);
            }
        }
    )
}
