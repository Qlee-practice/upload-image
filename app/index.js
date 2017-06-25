"use strict";

import Koa from 'koa'
import KoaRouter from 'koa-router'
import koaStatic from 'koa-static'
import path from 'path'
import BusBoy from 'busboy'
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import fs from 'fs';

const application = new Koa();
const router = new KoaRouter();

const imageDir = path.join(__dirname, 'public', 'images');
const imgDirDirname = path.dirname(imageDir);

const parseForm = req => new Promise((resolve, reject) => {

  const id = uuid();
  const files = {};

  const busboy = new BusBoy({ headers: req.headers });

  busboy.on('file', (_, file, filename) => {
    const name = `${id}${path.extname(filename)}`;
    const filepath = path.join(imageDir, name);

    file.on('end', () => files[filename] = filepath.replace(new RegExp(imgDirDirname), ''));

    file.pipe(fs.createWriteStream(filepath));
  }).on('error', reject)
    .on('finish', () => resolve({ files }));

  req.pipe(busboy);
});

router.post('/images', async ctx => {
  const { files } = await parseForm(ctx.req);
  ctx.body = files;
});

application.use(router.routes());

const publicDic = path.join(__dirname, 'public');

application.use(koaStatic(publicDic));

const porn = 3000;
application.listen(porn, () => console.log(`start server success at ${porn}`));

