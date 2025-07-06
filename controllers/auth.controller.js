import User from "../models/user.js";
import crypto from "crypto";

export async function signup(fastify, request, reply) {
  try {
    const { name, email, password, country } = request.body;

    const hashedPassword = await fastify.bcrypt.hash(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      country,
    });
    await user.save();

    reply.code(201).send({
      message: "User registered successfully",
    });
  } catch (error) {
    reply.send(error);
  }
}

export async function login(fastify, request, reply) {
  try {
    const { email, password } = request.body;

    const user = await User.findOne({
      email,
    });
    if (!user) {
      return reply.code(400).send({
        message: "Invalid email or password",
      });
    }

    const isValid = await fastify.bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.code(400).send({
        message: "Invalid email or password",
      });
    }

    const token = fastify.jwt.sign({
      id: user._id,
    });

    reply.code(200).send({
      message: "User logged successfully",
      token,
    });
  } catch (error) {
    reply.send(error);
  }
}

export async function forgotPassword(fastify, request, reply) {
  try {
    const { email } = request.body;

    const user = await User.findOne({
      email,
    });
    if (!user) {
      return reply.notFound();
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetPasswordExpiry;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:${fastify.config.PORT}/api/auth/reset-password/${resetToken}`;

    reply.send({
      resetUrl,
    });
  } catch (error) {
    reply.send(error);
  }
}

export async function resetPassword(fastify, request, reply) {
  const { token } = request.params;
  const { newPassword } = request.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return reply.badRequest("Invalid reset token");
  }

  const hashedPassword = await fastify.bcrypt.hash(newPassword);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  reply.send({
    message: "Password reset successfully",
  });
}

export async function logout(fastify, request, reply) {
  reply.send({
    message: "User logged out",
  });
}
