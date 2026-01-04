import amqp from "amqplib";
import { addVideo } from "../db/video";

const AMQP_URL = process.env.AMQP_URL!;

export async function videoConsume(){
    
    const connection = await amqp.connect(AMQP_URL);

    const channel = await connection.createChannel();

    await channel.assertQueue("video", {durable: true});
    
    await channel.prefetch(1);

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
                console.error("Failed to consume");
                channel.nack(msg, false, true);
            }
        }
    )
}
