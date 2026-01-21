import client from "prom-client";
import { addVideo } from "../db/video";
import { getChannel } from "../rabbitmq/producer";

const AMQP_URL = process.env.AMQP_URL!;

export async function videoConsume(){

    const channel = await getChannel();

    await channel.assertQueue("video", {durable: true});
    
    await channel.prefetch(5);

    console.log("video consumer started")
    const rabbitmq_messages_rejected = new client.Counter({
        name: 'rabbitmq_messages_rejected',
        help: 'Rabbitmq messages rejected',
        labelNames: ['action', 'service']
    })

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
                rabbitmq_messages_rejected.labels("video", "video-consumer").inc();
                channel.ack(msg);
            }
        }
    )
}
