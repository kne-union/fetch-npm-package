const download = require('./index');

(async () => {
    await download('@kne-components/ued', null, {
        callback: (dir) => {
            console.log(dir);
        }
    });
})();
