import { ActionContext, ActionTree } from "vuex";

import {
  IFeedlyUserInfo,
} from "../scripts/feedly.api.models";

import ISettingsModuleState from "./models";
import * as types from "./mutation-types";

import background from "../api/background";

const actions: ActionTree<ISettingsModuleState, ISettingsModuleState> = {
  [types.RETRIEVE_USER_INFO]({ commit }: ActionContext<ISettingsModuleState, ISettingsModuleState>): void {
    background.getUserInfo().then((user) => {
      if (user !== undefined) {
        commit(types.USER_INFO_RETRIEVED, user);
      }
    })
    .catch((reason) => {
      console.log("catched: ", reason);
    });
  },
  [types.LOGOUT_USER]({ commit }: ActionContext<ISettingsModuleState, ISettingsModuleState>): void {
    background.logout().then(() => commit(types.USER_LOGGED_OUT));
  },
};

export default actions;
