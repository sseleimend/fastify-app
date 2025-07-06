import fp from "fastify-plugin";
import mongoose from "mongoose";

export default fp(async (fastify, opts) => {
  try {
    await mongoose.connect(fastify.config.MONGODB_URI);
    fastify.decorate("mongoose", mongoose);
    fastify.log.info("MongoDB connected!");
  } catch (error) {
    fastify.log.error(err);
    process.exit(1);
  }
});
