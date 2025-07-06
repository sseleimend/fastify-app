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
