import "@fortawesome/fontawesome-free/css/all.css"; // Ensure you are using css-loader
import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: "#FFFFFF",
        // accent: '#272727',
        // secondary: '#ffe18d',
        // success: '#4CAF50',
        // info: '#2196F3',
        // warning: '#FB8C00',
        error: "#FF5252"
      }
    }
  },
  icons: {
    iconfont: "mdiSvg",
    values: {
      clear: 'far fa-times-circle'
    }
  }
});
