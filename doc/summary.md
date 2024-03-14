fetch-npm-package是一个仅在nodejs环境运行的包，不能web浏览器运行

可以从npm上下载对应包的某版本(未指定就选取latest)到当前系统的临时目录，可以通过参数指定输出目录，将文件Copy到输出目录，也可以传入操作方法，在操作执行完后，临时目录及其里面的文件将被清理。

使用方法：

```js
const download = require('@kne/fetch-npm-package');

await download(packageName, packageVersion, options);
```
