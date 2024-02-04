import { S3Client } from "@aws-sdk/client-s3";

declare global {
    var s3Client: S3Client | undefined;
}

import { PrismaClient } from '@prisma/client';

declare global {
    namespace NodeJS {
        interface Global {
            prisma: PrismaClient;
        }
    }
}