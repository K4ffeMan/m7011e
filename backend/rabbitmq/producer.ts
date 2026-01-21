import amqp from "amqplib";

const AMQP_URL = process.env.AMQP_URL!;
let channel: amqp.Channel;

export async function getChannel(): Promise<amqp.Channel>{
    if(channel){
        return channel;
    }
    while(true){
        try{
            console.log("creating connection from producer")
            const connection = await amqp.connect(AMQP_URL);

            channel = await connection.createChannel();

            await channel.assertQueue("video", {durable: true});
            await channel.assertQueue("votes", {durable: true});
            
            console.log("connection works")
            return channel;
        }catch(err: any) {
            console.error("Let's retry")
            await new Promise(r => setTimeout(r, 4000));
        }
    }
}
