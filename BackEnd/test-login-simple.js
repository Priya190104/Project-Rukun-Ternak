#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function test() {
  try {
    console.log('Testing login endpoint...');
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Success:', res.data);
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

test();
