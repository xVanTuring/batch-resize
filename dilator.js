const fse = require('fs-extra')
const path = require('path')
const { spawnSync } = require('child_process')
const dir = String.raw`C:\Users\xVan\Documents\workspace\HelmetDeep\assets\resources\textures\normal\makeover\room`
async function boot() {
    const items = await fse.readdir(dir)
    for (const name of items) {
        const result = await fse.stat(path.join(dir, name))
        if (result.isDirectory()) {
            // console.log(name)
            spawnSync('python -m dilator dilate_dir ' + String.raw`C:\Users\xVan\Documents\workspace\HelmetDeep\assets\resources\textures\normal\makeover\room\bosi`)
        }
    }
}

boot()
