import { CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from '@/lib/aws-config';

function shouldServeInline(contentType: string): boolean {
  return (contentType?.startsWith?.('image/') && contentType !== 'image/svg+xml') || contentType?.startsWith?.('video/') || contentType?.startsWith?.('audio/') || false;
}
const safeName = (name: string) => (name ?? 'arquivo').replace(/[^a-zA-Z0-9._-]/g, '-');
export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  const { bucketName, folderPrefix } = getBucketConfig();
  const cloud_storage_path = `${folderPrefix}${isPublic ? 'public/' : ''}uploads/${Date.now()}-${safeName(fileName)}`;
  const uploadUrl = await getSignedUrl(createS3Client(), new PutObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ContentType: contentType }), { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path };
}
export async function initiateMultipartUpload(fileName: string, contentType: string, isPublic: boolean) {
  const { bucketName, folderPrefix } = getBucketConfig();
  const cloud_storage_path = `${folderPrefix}${isPublic ? 'public/' : ''}uploads/${Date.now()}-${safeName(fileName)}`;
  const result = await createS3Client().send(new CreateMultipartUploadCommand({ Bucket: bucketName, Key: cloud_storage_path, ContentType: contentType }));
  return { uploadId: result?.UploadId ?? '', cloud_storage_path };
}
export async function getPresignedUrlForPart(cloud_storage_path: string, uploadId: string, partNumber: number) {
  const { bucketName } = getBucketConfig();
  return getSignedUrl(createS3Client(), new UploadPartCommand({ Bucket: bucketName, Key: cloud_storage_path, UploadId: uploadId, PartNumber: partNumber }), { expiresIn: 3600 });
}
export async function completeMultipartUpload(cloud_storage_path: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
  const { bucketName } = getBucketConfig();
  return createS3Client().send(new CompleteMultipartUploadCommand({ Bucket: bucketName, Key: cloud_storage_path, UploadId: uploadId, MultipartUpload: { Parts: parts ?? [] } }));
}
export async function getFileUrl(cloud_storage_path: string, contentType: string, isPublic: boolean) {
  const { bucketName } = getBucketConfig();
  if (isPublic) return `https://${bucketName}.s3.${process.env.AWS_REGION ?? 'us-west-2'}.amazonaws.com/${(cloud_storage_path ?? '').split('/').map(encodeURIComponent).join('/')}`;
  return getSignedUrl(createS3Client(), new GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ResponseContentDisposition: shouldServeInline(contentType ?? '') ? 'inline' : 'attachment' }), { expiresIn: 3600 });
}
export async function deleteFile(cloud_storage_path: string) {
  const { bucketName } = getBucketConfig();
  return createS3Client().send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}
