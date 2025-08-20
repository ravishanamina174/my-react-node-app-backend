"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_s3_1 = require("@aws-sdk/client-s3");
var S3;
if (process.env.NODE_ENV === "production") {
    S3 = new client_s3_1.S3Client({
        region: "auto",
        endpoint: "https://".concat(process.env.CLOUDFLARE_ACCOUNT_ID, ".r2.cloudflarestorage.com"),
        credentials: {
            accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
            secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
        },
    });
}
else {
    if (!global.cachedS3) {
        global.cachedS3 = new client_s3_1.S3Client({
            region: "auto",
            endpoint: "https://".concat(process.env.CLOUDFLARE_ACCOUNT_ID, ".r2.cloudflarestorage.com"),
            credentials: {
                accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
                secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
            },
        });
    }
    S3 = global.cachedS3;
}
exports.default = S3;
//# sourceMappingURL=s3.js.map