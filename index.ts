import core from '@actions/core';
import minio from "minio";
import glob from "glob";

(async () => {

    try {
        const access_key = core.getInput('access_key');
        const secret_key = core.getInput('secret_key');
        const endpoint = core.getInput('endpoint');
        const bucket = core.getInput('bucket');
        const source = core.getInput('source');
        const destination = core.getInput('destination');
        const port = core.getInput('port');
        const useSSL = core.getInput('useSSL');

        const minioClient = new minio.Client({
            endPoint: endpoint,
            port: parseInt(port) ?? 443,
            useSSL: (useSSL !== "false"),
            accessKey: access_key,
            secretKey: secret_key
        });
        // find files with glob
        const files = glob.sync(source);
        console.log(`Found ${files.length} files:\n    ${files.join("\n    ")}`);
        // upload files
        for (const file of files) {
            console.log(`Uploading ${file} to ${destination}`);
            await minioClient.fPutObject(bucket, (destination.endsWith("/") ? destination : `${destination}/`) + file, file).catch((e) => {
                core.setFailed(e.message);
                process.exit(1);
            });
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})()