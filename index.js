const loadNpmInfo = require('@kne/load-npm-info');
const tmp = require('tmp');
const path = require('node:path');
const lodash = require('lodash');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const decompress = require('decompress');

const RETRYABLE_CODES = new Set([
    'ERR_STREAM_PREMATURE_CLOSE',
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EPIPE',
    'ENOTFOUND'
]);

const isRetryableError = (err) => {
    if (!err) {
        return false;
    }
    if (RETRYABLE_CODES.has(err.code)) {
        return true;
    }
    if (err.type === 'system') {
        return true;
    }
    return /premature close|socket hang up|network/i.test(err.message || '');
};

const downloadTarball = async (url, fileDir, {retries = 3, delay = 1000} = {}) => {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {compress: false});
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            await fs.remove(fileDir);
            const stream = response.body.pipe(fs.createWriteStream(fileDir));
            await new Promise((resolve, reject) => {
                stream.on('close', resolve);
                stream.on('error', reject);
                response.body.on('error', reject);
            });
            return;
        } catch (err) {
            lastError = err;
            await fs.remove(fileDir).catch(() => {});
            if (attempt < retries && isRetryableError(err)) {
                console.warn(`下载 ${url} 失败 (第 ${attempt}/${retries} 次): ${err.message}，${delay * attempt}ms 后重试...`);
                await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                continue;
            }
            break;
        }
    }
    throw new Error(`下载 ${url} 失败，已重试 ${retries} 次: ${lastError.message}`);
};

const download = async (packageName, targetVersion, options) => {
    options = Object.assign({}, options);
    const {name, version: latestVersion, versions} = await loadNpmInfo(packageName);
    const version = targetVersion || latestVersion;
    const {tarball: url} = versions[version];
    const {tmpdir, cleanup} = await new Promise((resolve, reject) => {
        tmp.dir({unsafeCleanup: true}, (err, dir, callback) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({tmpdir: dir, cleanup: callback});
        });
    });

    const fileDir = path.resolve(tmpdir, lodash.last(url.split('/')));
    console.log(`[${name}/${version}]开始下载包:${url}`);
    await downloadTarball(url, fileDir);
    console.log(`[${name}/${version}]开始解压压缩包`);
    await decompress(fileDir, tmpdir);
    console.log(`[${name}/${version}]解压压缩包完成`);
    if (typeof options.callback === 'function') {
        console.log(`[${name}/${version}]执行callback操作`);
        await Promise.resolve(options.callback(path.resolve(tmpdir, 'package')));
    }
    if (!(typeof options.callback === 'function' && !(options.outputPath || process.env.OUTPUT_PATH))) {
        const output = path.resolve(process.cwd(), options.outputPath || process.env.OUTPUT_PATH || 'build');
        console.log(`[${name}/${version}]执行文件复制到输出目录${output}`);
        await fs.emptyDir(output);
        await fs.copy(path.resolve(tmpdir, 'package'), output);
    }
    console.log(`[${name}/${version}]任务执行完成！`);
    try {
        cleanup();
        console.log(`[${name}/${version}]完成临时目录清理`);
    } catch (e) {
        console.warn(`[${name}/${version}]临时目录清除失败`, e);
    }
};

module.exports = download;
