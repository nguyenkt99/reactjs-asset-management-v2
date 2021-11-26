import axios from 'axios'

const url = 'http://localhost:8082/api'
// const url = 'https://api-asset-ptithcm.herokuapp.com/api'
// const url = 'https://spring-asset-management-v2-production.up.railway.app/api'

function getHeader() {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
}

export function get(endpoint) {
  return axios.get(url + endpoint, {
    headers: getHeader()
  })
}

export function put(endpoint, body) {
  return axios.put(url + endpoint, body, {
    headers: getHeader()
  })
}

export function post(endpoint, body) {
  return axios.post(url + endpoint, body, {
    headers: getHeader()
  })
}

export function del(endpoint) {
  return axios.delete(url + endpoint, {
    headers: getHeader()
  })
}

export function patch(endpoint, body) {
  return axios.patch(url + endpoint, body, {
    headers: getHeader()
  })
}
