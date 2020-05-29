import Vue from "vue";
import axios from "axios";

// axios.defaults.baseURL = 'http://192.168.1.225:8088';

Vue.prototype.$http = axios;

export default axios;
