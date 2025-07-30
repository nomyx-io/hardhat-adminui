import { FastifyInstance } from "fastify";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { SocketStream } from "fastify-websocket";

export default async function (
  fastify: FastifyInstance,
  hre: HardhatRuntimeEnvironment
) {
  fastify.get(
    "/scenarios/ws",
    { websocket: true },
    (connection: SocketStream, req) => {
      connection.socket.on("message", (message: any) => {
        // For now, just echo the message back
        connection.socket.send(`Received: ${message.toString()}`);
      });
    }
  );
}
