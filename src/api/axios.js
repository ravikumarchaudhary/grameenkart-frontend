import axios from "axios";

const API = axios.create({
//   baseURL: "http://localhost:8000",
 baseURL: "http://192.168.0.102:8000",
//  baseURL: "http://192.168.5.13:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;