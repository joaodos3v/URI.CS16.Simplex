import Vue from "vue";
import App from "./App.vue";

import Toasted from "vue-toasted";
let toastedOptions = {
  position: "top-center",
  duration: 5000,
  keepOnHover: true,
  iconPack: "fontawesome",
  theme: "bubble",
  singleton: true
};
Vue.use(Toasted, toastedOptions);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount("#app");
