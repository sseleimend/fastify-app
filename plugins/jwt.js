import fp from "fastify-plugin";

export default fp(async (fastify, opts) => {
  await fastify.register(await import("@fastify/jwt"), {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      reply.send(error);
    }
  });
});
