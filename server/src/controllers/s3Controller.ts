import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Request, Response } from "express";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const randomImageName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");

export const getPresignedUrl = async (req: Request, res: Response) => {
  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    return res
      .status(400)
      .json({ message: "fileName and fileType are required" });
  }

  const uniqueFileName = `${randomImageName()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `recordings/${uniqueFileName}`,
    ContentType: fileType,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.status(200).json({ url });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
};
