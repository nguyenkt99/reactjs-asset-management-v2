import axios from 'axios';

const url = 'http://localhost:8082/api';
// const url = 'https://api-asset-ptithcm.herokuapp.com/api';

const token = localStorage.getItem('token');

export function get(endpoint) {
  return axios.get(url + endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function put(endpoint, body) {
  return axios.put(url + endpoint, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function post(endpoint, body) {
  return axios.post(url + endpoint, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function del(endpoint) {
  return axios.delete(url + endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function patch(endpoint, body) {
  return axios.patch(url + endpoint, body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
