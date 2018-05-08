import Vue from "vue";
import Vuex from "vuex";

import actions from "./actions";
import ISettingsModuleState from "./models";
import mutations from "./mutations";

Vue.use(Vuex);

const state: ISettingsModuleState = {
  user: undefined, // { id: "dasdasd", email: "akaSybe@gmail.com" },
  options: [],
  filters: [],
};

export default new Vuex.Store<ISettingsModuleState>({
  state,
  mutations,
  actions,
});
