import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import axios from "./plugins/axios";
import VueResize from "vue-resize";
import 'vue-resize/dist/vue-resize.css'

Vue.config.productionTip = false;
Vue.use(VueResize)

new Vue({
  router,
  store,
  vuetify,
  axios,
  render: h => h(App)
}).$mount("#app");
