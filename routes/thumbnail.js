import {
  createThumbnail,
  deleteAllThumbnails,
  deleteThumbnail,
  getThumbnail,
  getThumbnails,
  updateThumbnail,
} from "../controllers/thumbnail.controller.js";

export default async function (fastify, opts) {
  fastify.register(async function (fastify) {
    fastify.addHook("preHandler", fastify.authenticate);

    fastify.post("/", (request, reply) =>
      createThumbnail(fastify, request, reply)
    );
    fastify.get("/", (request, reply) =>
      getThumbnails(fastify, request, reply)
    );
    fastify.get("/:id", (request, reply) =>
      getThumbnail(fastify, request, reply)
    );
    fastify.put("/:id", (request, reply) =>
      updateThumbnail(fastify, request, reply)
    );
    fastify.delete("/:id", (request, reply) =>
      deleteThumbnail(fastify, request, reply)
    );
    fastify.delete("/", (request, reply) =>
      deleteAllThumbnails(fastify, request, reply)
    );
  });
}
