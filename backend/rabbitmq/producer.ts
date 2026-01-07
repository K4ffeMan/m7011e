import amqp from "amqplib";

const AMQP_URL = process.env.AMQP_URL!;
let channel: amqp.Channel;

export async function getChannel(): Promise<amqp.Channel>{
    if(channel){
        return channel;
    }
    try{
        const connection = await amqp.connect(AMQP_URL);

        channel = await connection.createChannel();

        await channel.assertQueue("video", {durable: true});
        await channel.assertQueue("votes", {durable: true});
        

        return channel;
    }catch(err: any) {
        console.error("Rabbitmq does not seem to work")
        throw err;
    }
}
