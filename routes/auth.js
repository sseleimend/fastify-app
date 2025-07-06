import {
  login,
  signup,
  forgotPassword,
  logout,
  resetPassword,
} from "../controllers/auth.controller.js";

export default function (fastify, opts) {
  fastify.post("/register", (request, reply) =>
    signup(fastify, request, reply)
  );
  fastify.post("/login", (request, reply) => login(fastify, request, reply));
  fastify.post(
    "/forgot-password",
    forgotPassword(request, reply) => (fastify, request, reply)
  );
  fastify.post("/reset-password/:token", (request, reply) =>
    resetPassword(fastify, request, reply)
  );
  fastify.post("/logout",{
    preHandler: [fastify.authenticate]
  } , (request, reply) =>
    logout(fastify, request, reply)
  );
}
