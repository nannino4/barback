resource "aws_s3_bucket" "profile_pictures" {
  count = var.manage_profile_pictures_bucket ? 1 : 0

  bucket = var.profile_pictures_bucket_name
}

resource "aws_s3_bucket_public_access_block" "profile_pictures" {
  count = var.manage_profile_pictures_bucket ? 1 : 0

  bucket = aws_s3_bucket.profile_pictures[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "profile_pictures" {
  count = var.manage_profile_pictures_bucket ? 1 : 0

  bucket = aws_s3_bucket.profile_pictures[0].id

  rule {
    bucket_key_enabled = true

    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "profile_pictures" {
  count = var.manage_profile_pictures_bucket ? 1 : 0

  bucket = aws_s3_bucket.profile_pictures[0].id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = var.profile_pictures_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

data "aws_iam_policy_document" "profile_pictures" {
  count = var.manage_profile_pictures_bucket ? 1 : 0

  statement {
    sid = "AllowCloudFrontServicePrincipal"

    actions = ["s3:GetObject"]

    resources = [
      "${aws_s3_bucket.profile_pictures[0].arn}/*",
    ]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "ArnLike"
      variable = "AWS:SourceArn"
      values   = [var.profile_pictures_cloudfront_distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "profile_pictures" {
  count = var.manage_profile_pictures_bucket ? 1 : 0

  bucket = aws_s3_bucket.profile_pictures[0].id
  policy = data.aws_iam_policy_document.profile_pictures[0].json
}
