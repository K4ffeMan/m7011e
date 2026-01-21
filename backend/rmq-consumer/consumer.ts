import express from "express";
import client from "prom-client";
import { castVote } from "../db/votes";
import { getChannel } from "../rabbitmq/producer";

const AMQP_URL = process.env.AMQP_URL!;

client.collectDefaultMetrics();

const app = express();

app.get("/metrics", async(_req, res) =>{
  res.set("content-type", client.register.contentType);
  res.end(await client.register.metrics());
});

export async function voteConsume(){
    const channel = await getChannel();

    await channel.assertQueue("votes", {durable: true});
    
    await channel.prefetch(5);
    

    console.log("vote consumer started")
    const rabbitmq_messages_rejected = new client.Counter({
        name: 'rabbitmq_messages_rejected',
        help: 'Rabbitmq messages rejected',
        labelNames: ['action', 'service']
    })
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
                rabbitmq_messages_rejected.labels("vote", "vote-consumer").inc();
                channel.ack(msg);
            }
        }
    )
}
