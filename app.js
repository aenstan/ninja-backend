'use strict';

import cors from '@koa/cors';
import Router from '@koa/router';
import Koa from 'koa';
import body from 'koa-body';
import User from './user.js';

// Create express instance
const app = new Koa();
const router = new Router();

const handler = async (ctx, next) => {
  try {
    ctx.body = {
      code: undefined,
      data: undefined,
      message: '',
    };
    await next();
    ctx.body.code = ctx.body.code || ctx.status;
    if (ctx.body?.data?.message) {
      ctx.body.message = ctx.body.data.message;
      ctx.body.data.message = undefined;
    }
  } catch (err) {
    console.log(err);
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      code: err.status || err.statusCode || 500,
      message: err.message,
    };
  }
};

app.use(cors()).use(handler).use(router.routes()).use(router.allowedMethods());

router.get('/api/status', (ctx) => {
  ctx.body = 'Ninja is already.';
});

router.get('/api/info', async (ctx) => {
  const data = await User.getPoolInfo();
  ctx.body.data = data;
});

router.get('/api/qrcode', async (ctx) => {
  const user = new User({});
  await user.getQRConfig();
  ctx.body.data = {
    token: user.token,
    okl_token: user.okl_token,
    cookies: user.cookies,
    QRCode: user.QRCode,
  };
});

router.post('/api/check', body(), async (ctx) => {
  const body = ctx.request.body;
  const user = new User(body);
  const data = await user.checkQRLogin();
  ctx.body.data = data;
});

router.post('/api/cklogin', body(), async (ctx) => {
  const body = ctx.request.body;
  const user = new User(body);
  const data = await user.CKLogin();
  ctx.body.data = data;
});

router.get('/api/userinfo', async (ctx) => {
  const query = ctx.query;
  const eid = query.eid;
  const user = new User({ eid });
  const data = await user.getUserInfoByEid();
  ctx.body.data = data;
});

router.post('/api/delaccount', body(), async (ctx) => {
  const body = ctx.request.body;
  const eid = body.eid;
  const user = new User({ eid });
  const data = await user.delUserByEid();
  ctx.body.data = data;
});

router.post('/api/uploadpushtoken', body(), async (ctx) => {
  const body = ctx.request.body;
  const eid = body.eid;
  const pushToken = body.push_token;
  const user = new User({ eid, pushToken });
  const data = await user.updateToken();
  ctx.body.data = data;
});

app.listen(5701);
