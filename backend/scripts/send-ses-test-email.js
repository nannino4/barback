#!/usr/bin/env node
/* eslint-disable no-console */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const requiredEnv = [
  'SES_REGION',
  'SES_ACCESS_KEY_ID',
  'SES_SECRET_ACCESS_KEY',
  'EMAIL_FROM',
];

for (const key of requiredEnv)
{
  if (!process.env[key])
  {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const toAddress = process.env.SES_TEST_TO || 'success@simulator.amazonses.com';

async function main()
{
  const client = new SESClient({
    region: process.env.SES_REGION,
    credentials: {
      accessKeyId: process.env.SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    },
  });

  const result = await client.send(new SendEmailCommand({
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Subject: {
        Data: 'Barback SES API validation',
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: 'SES API validation for barback.it.',
          Charset: 'UTF-8',
        },
      },
    },
  }));

  console.log(JSON.stringify({
    to: toAddress,
    messageId: result.MessageId,
  }, null, 2));
}

main().catch((error) =>
{
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
