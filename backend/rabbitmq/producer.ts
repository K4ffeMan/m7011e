import amqp from "amqplib";

const AMQP_URL = process.env.AMQP_URL!;
let channel: amqp.Channel;

export async function getChannel(){
    if(channel){
        return channel;
    }
    const connection = await amqp.connect(AMQP_URL);

    channel = await connection.createChannel();

    await channel.assertQueue("video", {durable: true});
    await channel.assertQueue("votes", {durable: true});
    

    return channel;
}
