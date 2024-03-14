
# fetch-npm-package


### 描述

下载并解压npm包文件


### 安装

```shell
npm i --save @kne/fetch-npm-package
```


### 概述

fetch-npm-package是一个仅在nodejs环境运行的包，不能web浏览器运行

可以从npm上下载对应包的某版本(未指定就选取latest)到当前系统的临时目录，可以通过参数指定输出目录，将文件Copy到输出目录，也可以传入操作方法，在操作执行完后，临时目录及其里面的文件将被清理。

使用方法：

```js
const download = require('@kne/fetch-npm-package');

await download(packageName, packageVersion, options);
```


### 示例

#### 示例代码



### API

| 属性名                   | 说明                                                                                                       | 类型       | 默认值   |
|-----------------------|----------------------------------------------------------------------------------------------------------|----------|-------|
| packageName           | 需要下载的包名                                                                                                  | string   | -     |
| packageVersion        | 需要下载的包的版本号，缺省则会回去该包的latest版本                                                                             | string   | -     |
| options               | 其他参数                                                                                                     | object   | -     |
| options.outputPath    | 输出目录，可以通过环境变量OUTPUT_PATH传递，该参数存在时优先使用该参数                                                                 | string   | build |
| options.callback(dir) | 可以获取临时目录参数，在该函数执行完之后，将清理临时目录，该参数存在时，将不默认将outputPath设置为build，如果没有通过环境变量或者options.outputPath设置输出目录则不默认输出文件 | function | -     |

