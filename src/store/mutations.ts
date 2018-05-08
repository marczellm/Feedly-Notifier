import Vue from "vue";
import { MutationTree } from "vuex";

import {
  IFeedlyUserInfo,
} from "../scripts/feedly.api.models";
import {
  IFeedlyNotifierCategory,
} from "../scripts/models";

import ISettingsModuleState from "./models";
import * as types from "./mutation-types";

const mutations: MutationTree<ISettingsModuleState> = {
  [types.USER_INFO_RETRIEVED](state, payload): void {
    state.user = payload;
  },
  [types.USER_LOGGED_OUT](state) {
    state.user = undefined;
  },
  // [types.RECEIVE_OPTIONS]: (state, {options, filters}: {options: any, filters: IFeedlyNotifierCategory[]}) => {
  //   // TODO: merge options and filters
  //   state.options = options;
  //   state.filters = filters;
  // },
};

export default mutations;
