import Thumbnail from "../models/thumbnail.js";
import path from "path";
import fs from "fs";
import { pipeline } from "stream";
import util from "util";

const pipelineAsync = util.promisify(pipeline);

export async function createThumbnail(fastify, request, reply) {
  try {
    const parts = request.files();

    let fields = {};
    let filename;

    for await (const part of parts) {
      if (part.file) {
        filename = `${Date.now()}-${part.filename}`;
        const saveTo = path.join(
          dirname(fileURLToPath(import.meta.url)),
          "..",
          "uploads",
          "thumbnails",
          filename
        );
        await pipelineAsync(part.file, fs.createWriteStream(saveTo));
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const thumbnail = new Thumbnail({
      user: request.user.id,
      videoName: fields.videoName,
      version: fields.version,
      image: "/uploads/thumbnails/" + filename,
      paid: fields.paid === "true",
    });

    await thumbnail.save();

    reply.code(201).send(thumbnail);
  } catch (err) {
    reply.send(err);
  }
}

export async function getThumbnails(fastify, request, reply) {
  try {
    const thumbnails = await Thumbnail.find({
      user: request.user.id,
    });
    reply.send(thumbnails);
  } catch (error) {
    reply.send(error);
  }
}

export async function getThumbnail(fastify, request, reply) {
  try {
    await Thumbnail.findOne({
      _id: request.params.id,
      user: request.user.id,
    });
    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }
    reply.send(thumbnail);
  } catch (error) {
    reply.send(error);
  }
}

export async function updateThumbnail(fastify, request, reply) {
  try {
    const updatedData = request.body;

    const thumbnail = await Thumbnail.findByIdAndUpdate(
      {
        _id: request.params.id,
        user: request.user.id,
      },
      updatedData,
      { new: true }
    );

    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }
    reply.send(thumbnail);
  } catch (error) {
    reply.send(error);
  }
}

export async function deleteThumbnail(fastify, request, reply) {
  try {
    const thumbnail = await Thumbnail.findByIdAndDelete({
      _id: request.params.id,
      user: request.user.id,
    });

    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }

    const filePath = path.join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "uploads",
      "thumbnails",
      path.basename(thumbnail.image)
    );
    fs.unlink(filePath, (err) => {
      if (err) fastify.log.error(err);
    });

    reply.send({
      message: "Thumbnail deleted",
    });
  } catch (error) {
    reply.send(error);
  }
}

export async function deleteAllThumbnails(fastify, request, reply) {
  try {
    const thumbnails = await Thumbnail.find({
      user: request.user.id,
    });
    await Thumbnail.deleteMany({
      user: request.user.id,
    });

    for (const thumbnail of thumbnails) {
      const filePath = path.join(
        dirname(fileURLToPath(import.meta.url)),
        "..",
        "uploads",
        "thumbnails",
        path.basename(thumbnail.image)
      );
      fs.unlink(filePath, (err) => {
        if (err) fastify.log.error(err);
      });
    }

    reply.send({
      message: "All thumbnails deleted",
    });
  } catch (error) {
    reply.send(error);
  }
}
