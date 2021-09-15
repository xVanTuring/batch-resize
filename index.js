const fse = require('fs-extra')
const async = require('async')
const path = require('path')
const sharp = require('sharp')
const { resolve } = require('path');
const { readdir } = require('fs').promises;

const sourceDir = `./source`
const resizeRatio = 0.625

let total = 0
let done = 0;
let png = 0
let jepg = 0
const outDir = './output'

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}
const q = async.queue((task, callback) => {
    const { baseDirName, img } = task;
    const image = sharp(img)
    image.metadata()
        .then((metadata) => {
            return image.resize({ width: Math.round(metadata.width * resizeRatio) })
        })
        .then((data) => {
            if (img.endsWith(".png")) {
                png++
                // return data.jpeg({
                //     quality: 100
                // })
                return data.png({ compressionLevel: 9 })
            } else {
                jepg++
                return data
            }
        })
        .then((data) => {
            // const finalName = path.basename(img).split('.')[0] + '.jpg'
            const finalName = path.basename(img)
            return fse.ensureDir(path.join(outDir, baseDirName)).then(() => {
                return data.toFile(path.join(outDir, baseDirName, finalName))
            })
        })
        .then((outputInfo) => {
            done++
            console.log(`${done}/${total}`)
            callback()
        }).catch(() => {
            console.error(`Failed to convert img: ${img}`)
        })
}, 10)
async function boot() {
    for await (const f of getFiles(sourceDir)) {
        if (!(f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"))) {
            continue
        }
        total++
        q.push({
            baseDirName: path.dirname(path.relative(sourceDir, f)),
            img: f
        })
    }
    await q.drain()
    console.log(`PNG: ${png}. JPG:${jepg}`)
}
boot()