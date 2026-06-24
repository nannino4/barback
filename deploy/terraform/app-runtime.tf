data "aws_caller_identity" "current" {}

resource "aws_iam_user" "app_email_sender" {
  count = var.create_app_runtime_credentials ? 1 : 0

  name = "barback-app-email-${var.environment}"

  tags = {
    Purpose = "app-email-sending"
  }
}

resource "aws_iam_user_policy" "app_email_sender" {
  count = var.create_app_runtime_credentials ? 1 : 0

  name = "barback-app-email-${var.environment}"
  user = aws_iam_user.app_email_sender[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SendFromBarbackDomain"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
        ]
        Resource = "arn:aws:ses:${var.ses_region}:${data.aws_caller_identity.current.account_id}:identity/${local.domain_name}"
      },
    ]
  })
}

resource "aws_iam_access_key" "app_email_sender" {
  count = var.create_app_runtime_credentials ? 1 : 0

  user = aws_iam_user.app_email_sender[0].name
}

resource "aws_iam_user" "app_storage" {
  count = var.create_app_runtime_credentials ? 1 : 0

  name = "barback-app-storage-${var.environment}"

  tags = {
    Purpose = "app-profile-picture-storage"
  }
}

resource "aws_iam_user_policy" "app_storage" {
  count = var.create_app_runtime_credentials ? 1 : 0

  name = "barback-app-storage-${var.environment}"
  user = aws_iam_user.app_storage[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteAndDeleteProfilePictures"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = "arn:aws:s3:::${var.profile_pictures_bucket_name}/users/*"
      },
    ]
  })
}

resource "aws_iam_access_key" "app_storage" {
  count = var.create_app_runtime_credentials ? 1 : 0

  user = aws_iam_user.app_storage[0].name
}
