const loadNpmInfo = require('@kne/load-npm-info');
const tmp = require("tmp");
const path = require("path");
const lodash = require('lodash');
const request = require('request-promise');
const fs = require('fs-extra');
const decompress = require("decompress");
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
    await new Promise((resolve, reject) => {
        console.log(`[${name}/${version}]开始下载包:${url}`);
        const stream = request(url).pipe(fs.createWriteStream(fileDir));
        stream.on('close', () => {
            resolve();
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
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
