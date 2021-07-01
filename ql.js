'use strict';

import axios from 'axios';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';

dotenv.config();

const qlDir = process.env.QL_DIR || '/ql';
const authFile = path.join(qlDir, 'config/auth.json');
const baseUrl = process.env.QL_URL || 'http://localhost:5600';

async function getToken() {
  const authConfig = JSON.parse(await readFile(authFile));
  return authConfig.token;
}

export async function getEnvs() {
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
}

export async function getEnvsCount() {
  const data = await getEnvs();
  return data.length;
}

export async function addEnv(cookie) {
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
}

export async function updateEnv(cookie, eid, pushToken) {
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
}

export async function delEnv(eid) {
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
}
