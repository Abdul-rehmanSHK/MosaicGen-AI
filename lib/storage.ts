import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.AWS_S3_ENDPOINT || undefined,
    })
  : null;

export async function uploadImageToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string = "image/png"
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || "ai-mosaic-bucket";

  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `generations/${fileName}`,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);

      if (process.env.AWS_S3_ENDPOINT) {
        return `${process.env.AWS_S3_ENDPOINT}/${bucketName}/generations/${fileName}`;
      }
      return `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/generations/${fileName}`;
    } catch (error) {
      console.error("S3 upload failed, falling back to data URL:", error);
    }
  }

  // Fallback to data URL for immediate local preview without cloud config
  const base64 = buffer.toString("base64");
  return `data:${contentType};base64,${base64}`;
}
