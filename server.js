import path from "path";
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

const schema = {
  type: "object",
  required: ["PORT", "MONGODB_URI", "JWT_SECRET"],
  properties: {
    PORT: {
      type: "number",
      default: 3000,
    },
    MONGODB_URI: {
      type: "string",
    },
    JWT_SECRET: {
      type: "string",
    },
  },
};

const options = {
  confKey: "config", // adiciona as variáveis em fastify.config
  schema,
  dotenv: true,
};

try {
  await fastify.register(await import("@fastify/env"), options);
  await fastify.register(await import("@fastify/cors"));
  await fastify.register(await import("@fastify/sensible"));
  await fastify.register(await import("./plugins/mongodb.js"));
  fastify.register(await import("fastify-bcrypt"), {
    saltWorkFactor: 12,
  });

  fastify.get("/test-db", async (request, reply) => {
    try {
      const connectionState = fastify.mongoose.connection.readyState;
      let status = "";

      switch (connectionState) {
        case 0:
          status = "disconnected";
          break;
        case 1:
          status = "connected";
          break;
        case 2:
          status = "connecting";
          break;
        case 3:
          status = "disconnecting";
          break;
        default:
          status = "unknown";
      }
      reply.send({ database: status });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        error: "Failed to test database",
      });
      process.exit(1);
    }
  });

  fastify.get("/", (request, reply) => {
    reply.send({ hello: "world" });
  });

  const port = fastify.config.PORT;

  await fastify.listen({ port });
  fastify.log.info(`Server is running at http://localhost:${port}`);
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
