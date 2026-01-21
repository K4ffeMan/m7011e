import { addVideo } from "../db/video";
import { rabbitmq_messages_rejected } from "../rabbitmq";
import { getChannel } from "../rabbitmq/producer";

const AMQP_URL = process.env.AMQP_URL!;

export async function videoConsume(){

    const channel = await getChannel();

    await channel.assertQueue("video", {durable: true});
    
    await channel.prefetch(5);

    console.log("video consumer started")

    channel.consume(
        "video",
        async (msg) => {
            if(!msg){
                return;
            }
            try{
                const incom = JSON.parse(msg.content.toString());
        
                await addVideo(incom.roomId, incom.url);

                channel.ack(msg);
            }catch(err: any){
                if(err.message === "Video exists in room"){
                    channel.ack(msg);
                    return;
                }
                console.log("video failed", err)
                rabbitmq_messages_rejected.labels("vote", "video-consumer").inc();
                channel.ack(msg);
            }
        }
    )
}
