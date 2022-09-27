import * as core from '@actions/core';
import * as minio from "minio";
import glob from "glob";
import fs from "fs";

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
        let files: [string, string][] = [];
        if (source.includes("*")) {
            files = glob.sync(source).map(file => [file, file]);
        } else {
            if (fs.existsSync(source)) {
                if (fs.statSync(source).isFile()) {
                    files = [[source, source]];
                } else {
                    files = fs.readdirSync(source).map(f => [source + "/" + f, f]);
                }
            }
        }
        console.log(`Found ${files.length} files:\n    ${files.join("\n    ")}`);
        // upload files
        for (const file of files) {
            console.log(`Uploading ${file} to ${destination}`);
            await minioClient.fPutObject(bucket, (destination.endsWith("/") ? destination : `${destination}/`) + file[1], file[0]).catch((e) => {
                core.setFailed(e.message);
                process.exit(1);
            });
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})()