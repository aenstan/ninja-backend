/* eslint-disable camelcase */
'use strict';

import axios from 'axios';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import { addEnv, delEnv, getEnvs, getEnvsCount, updateEnv } from './ql.js';

dotenv.config();
export default class User {
  pt_key;
  pt_pin;
  cookie;
  eid;
  timestamp;
  nickName;
  pushToken;
  token;
  okl_token;
  cookies;
  QRCode;
  #s_token;

  constructor({ token, okl_token, cookies, pt_key, pt_pin, eid, pushToken }) {
    this.token = token;
    this.okl_token = okl_token;
    this.cookies = cookies;
    this.pt_key = pt_key;
    this.pt_pin = pt_pin;
    this.eid = eid;
    this.pushToken = pushToken;

    if (pt_key && pt_pin) {
      this.cookie = 'pt_key=' + this.pt_key + ';pt_pin=' + this.pt_pin + ';';
    }
  }

  async getQRConfig() {
    const taskUrl = `https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${Date.now()}&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`;
    const response = await axios({
      url: taskUrl,
      headers: {
        Connection: 'Keep-Alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-cn',
        Referer: taskUrl,
        'User-Agent':
          'jdapp;android;10.0.5;11;0393465333165363-5333430323261366;network/wifi;model/M2102K1C;osVer/30;appBuild/88681;partner/lc001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; M2102K1C Build/RKQ1.201112.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045534 Mobile Safari/537.36',
        Host: 'plogin.m.jd.com',
      },
    });
    const headers = response.headers;

    const data = response.data;
    await this.#formatSetCookies(headers, data);

    if (!this.#s_token) {
      throw new Error('二维码创建失败！');
    }

    const nowTime = Date.now();
    // eslint-disable-next-line prettier/prettier
    const taskPostUrl = `https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=${
      this.#s_token
    }&v=${nowTime}&remember=true`;

    const configRes = await axios({
      method: 'post',
      url: taskPostUrl,
      data: `lang=chs&appid=300&source=wq_passport&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${nowTime}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action`,
      headers: {
        Connection: 'Keep-Alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-cn',
        Referer: taskUrl,
        'User-Agent':
          'jdapp;android;10.0.5;11;0393465333165363-5333430323261366;network/wifi;model/M2102K1C;osVer/30;appBuild/88681;partner/lc001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; M2102K1C Build/RKQ1.201112.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045534 Mobile Safari/537.36',
        Host: 'plogin.m.jd.com',
        Cookie: this.cookies,
      },
    });
    const configHeaders = configRes.headers;
    const configData = configRes.data;

    this.token = configData.token;
    if (this.token)
      this.QRCode = await QRCode.toDataURL(
        `https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=${this.token}`
      );
    const cookies = configHeaders['set-cookie'][0];
    this.okl_token = cookies.substring(cookies.indexOf('=') + 1, cookies.indexOf(';'));
  }

  async checkQRLogin() {
    if (!this.token || !this.okl_token || !this.cookies) {
      throw new Error('初始化登录请求失败！');
    }
    const nowTime = Date.now();
    const loginUrl = `https://plogin.m.jd.com/login/login?appid=300&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${nowTime}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport`;
    const getUserCookieUrl = `https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=${this.token}&ou_state=0&okl_token=${this.okl_token}`;
    const response = await axios({
      method: 'POST',
      url: getUserCookieUrl,
      data: `lang=chs&appid=300&source=wq_passport&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${nowTime}&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action`,
      headers: {
        Connection: 'Keep-Alive',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-cn',
        Referer: loginUrl,
        'User-Agent':
          'jdapp;android;10.0.5;11;0393465333165363-5333430323261366;network/wifi;model/M2102K1C;osVer/30;appBuild/88681;partner/lc001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; M2102K1C Build/RKQ1.201112.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045534 Mobile Safari/537.36',
        Cookie: this.cookies,
      },
    });

    const data = response.data;
    const headers = response.headers;
    if (data.errcode === 0) {
      const pt_key = headers['set-cookie'][1];
      this.pt_key = pt_key.substring(pt_key.indexOf('=') + 1, pt_key.indexOf(';'));
      const pt_pin = headers['set-cookie'][2];
      this.pt_pin = pt_pin.substring(pt_pin.indexOf('=') + 1, pt_pin.indexOf(';'));
      this.cookie = 'pt_key=' + this.pt_key + ';pt_pin=' + this.pt_pin + ';';

      const result = await this.CKLogin();
      result.errcode = 0;
      return result;
    }

    return {
      errcode: data.errcode,
      message: data.message,
      nickName: this.nickName,
    };
  }

  async CKLogin() {
    let message;
    await this.#getNickname();
    const envs = await getEnvs();
    const poolInfo = await User.getPoolInfo();
    const env = await envs.find((item) => item.value.match(/pt_pin=(.*?);/)[1] === this.pt_pin);
    if (!env) {
      // 新用户
      if (!poolInfo.allowAdd) {
        throw new UserError('管理员已关闭注册，去其他地方看看吧', 210, 200);
      } else if (poolInfo.marginCount === 0) {
        throw new UserError('本站已到达注册上限，你来晚啦', 211, 200);
      } else {
        const body = await addEnv(this.cookie);
        if (body.code !== 200) {
          throw new UserError(body.message || '添加账户错误，请重试', 220, body.code || 200);
        }
        this.eid = body.data._id;
        this.timestamp = body.data.timestamp;
        message = `添加成功，可以愉快的白嫖啦 ${this.nickName}`;
      }
    } else {
      this.eid = env._id;
      const body = await updateEnv(this.cookie, this.eid);
      if (body.code !== 200) {
        throw new UserError(body.message || '更新账户错误，请重试', 221, body.code || 200);
      }
      this.timestamp = body.data.timestamp;
      message = `欢迎回来，${this.nickName}`;
    }
    return {
      nickName: this.nickName,
      eid: this.eid,
      timestamp: this.timestamp,
      message,
    };
  }

  async getUserInfoByEid() {
    const envs = await getEnvs();
    const env = await envs.find((item) => item._id === this.eid);
    if (!env) {
      throw new UserError('没有找到这个账户，重新登录试试看哦', 230, 200);
    }
    this.cookie = env.value;
    this.timestamp = env.timestamp;
    this.pushToken = env.remarks;
    await this.#getNickname();
    return {
      nickName: this.nickName,
      eid: this.eid,
      timestamp: this.timestamp,
      push_token: this.pushToken,
    };
  }

  async updateToken() {
    if (!this.eid || !this.pushToken) {
      throw new UserError('参数错误', 240, 200);
    }

    const response = await axios({
      method: 'post',
      url: 'https://www.pushplus.plus/send',
      data: {
        token: this.pushToken,
        content: '这是一条测试消息，能收到说明你 token 填对啦',
      },
    });
    if (response.data.code !== 200) {
      throw new UserError('测试 Push Token 出错，请检查后后再尝试', 242, 200);
    }

    const envs = await getEnvs();
    const env = await envs.find((item) => item._id === this.eid);
    if (!env) {
      throw new UserError('没有找到这个账户，重新登录试试看哦', 230, 200);
    }
    this.cookie = env.value;

    const body = await updateEnv(this.cookie, this.eid, this.pushToken);
    if (body.code !== 200) {
      throw new UserError('更新/上传 Push Token 出错，请重试', 241, 200);
    }

    return {
      message: '更新/上传 Push Token 成功',
    };
  }

  async delUserByEid() {
    const body = await delEnv(this.eid);
    if (body.code === 200) {
      if (body.code !== 200) {
        throw new UserError(body.message || '删除账户错误，请重试', 240, body.code || 200);
      }
    }
    return {
      message: '账户已移除',
    };
  }

  static async getPoolInfo() {
    const count = await getEnvsCount();
    const allowCount = (process.env.ALLOW_NUM || 40) - count;
    return {
      marginCount: allowCount >= 0 ? allowCount : 0,
      allowAdd: Boolean(process.env.ALLOW_ADD) || true,
    };
  }

  async #getNickname() {
    const response = await axios({
      url: `https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`,
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-cn',
        Connection: 'keep-alive',
        Cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36',
        Host: 'me-api.jd.com',
      },
    });
    if (!response.data.data?.userInfo) {
      throw new UserError('获取用户信息失败，请检查您的 cookie ！', 201, 200);
    }
    this.nickName = response.data.data?.userInfo.baseInfo.nickname || this.pt_pin;
  }

  #formatSetCookies(headers, body) {
    return new Promise((resolve) => {
      let guid, lsid, ls_token;
      this.#s_token = body.s_token;
      guid = headers['set-cookie'][0];
      guid = guid.substring(guid.indexOf('=') + 1, guid.indexOf(';'));
      lsid = headers['set-cookie'][2];
      lsid = lsid.substring(lsid.indexOf('=') + 1, lsid.indexOf(';'));
      ls_token = headers['set-cookie'][3];
      ls_token = ls_token.substring(ls_token.indexOf('=') + 1, ls_token.indexOf(';'));
      this.cookies = `guid=${guid};lang=chs;lsid=${lsid};ls_token=${ls_token};`;
      resolve();
    });
  }
}

class UserError extends Error {
  constructor(message, status, statusCode) {
    super(message);
    this.name = 'UserError';
    this.status = status;
    this.statusCode = statusCode || 200;
  }
}
