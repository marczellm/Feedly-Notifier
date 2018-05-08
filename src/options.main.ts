import Vue from "vue";
import VueMaterial from "vue-material";
import Vuex from "vuex";

/* tslint:disable ordered-imports */
import "vue-material/dist/vue-material.css";
import "vue-material/dist/theme/default.css";
/* tslint:disable ordered-imports */

import store from "./store";

Vue.use(VueMaterial);
Vue.use(Vuex);

import App from "./App.vue";

/* tslint:disable no-unused-expression */
new Vue({
  el: "#app",
  store,
  render: (h) => h(App),
});
/* tslint:enable no-unused-expression */
