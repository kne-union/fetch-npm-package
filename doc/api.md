| 属性名                   | 说明                                                                                                       | 类型       | 默认值   |
|-----------------------|----------------------------------------------------------------------------------------------------------|----------|-------|
| packageName           | 需要下载的包名                                                                                                  | string   | -     |
| packageVersion        | 需要下载的包的版本号，缺省则会回去该包的latest版本                                                                             | string   | -     |
| options               | 其他参数                                                                                                     | object   | -     |
| options.outputPath    | 输出目录，可以通过环境变量OUTPUT_PATH传递，该参数存在时优先使用该参数                                                                 | string   | build |
| options.callback(dir) | 可以获取临时目录参数，在该函数执行完之后，将清理临时目录，该参数存在时，将不默认将outputPath设置为build，如果没有通过环境变量或者options.outputPath设置输出目录则不默认输出文件 | function | -     |
