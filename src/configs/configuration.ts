export default () => ({
  port: parseInt(process.env.PORT ?? '5500', 10),

  // AWS S3
  s3_bucket_name: process.env.S3_BUCKET_NAME,
  aws_region: process.env.AWS_REGION,
});
