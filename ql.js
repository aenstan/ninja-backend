'use strict';

const axios = require('axios');
require('dotenv').config();
const { readFile } = require('fs/promises');
const path = require('path');

const qlDir = process.env.QL_DIR || '/ql';
const authFile = path.join(qlDir, 'config/auth.json');
const baseUrl = process.env.QL_URL || 'http://localhost:5600';

async function getToken() {
  const authConfig = JSON.parse(await readFile(authFile));
  return authConfig.token;
}

module.exports.getEnvs = async () => {
  const token = await getToken();
  const response = await axios.get('/api/envs', {
    params: {
      searchValue: 'JD_COOKIE',
      t: Date.now(),
    },
    baseURL: baseUrl,
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

module.exports.getEnvsCount = async () => {
  const data = await this.getEnvs();
  return data.length;
};

module.exports.addEnv = async (cookie) => {
  const token = await getToken();
  const response = await axios({
    method: 'post',
    url: '/api/envs',
    params: { t: Date.now() },
    data: {
      name: 'JD_COOKIE',
      value: cookie,
    },
    baseURL: baseUrl,
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  return response.data;
};

module.exports.updateEnv = async (cookie, eid, pushToken) => {
  const token = await getToken();
  const response = await axios({
    method: 'put',
    url: 'api/envs',
    params: { t: Date.now() },
    data: {
      name: 'JD_COOKIE',
      value: cookie,
      _id: eid,
      remarks: pushToken,
    },
    baseURL: baseUrl,
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  return response.data;
};

module.exports.delEnv = async (eid) => {
  const token = await getToken();
  const response = await axios({
    method: 'delete',
    url: 'api/envs',
    params: { t: Date.now() },
    data: [eid],
    baseURL: baseUrl,
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
  return response.data;
};
