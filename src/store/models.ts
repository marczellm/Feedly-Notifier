import {
  IFeedlyUserInfo,
} from "../scripts/feedly.api.models";

export default interface ISettingsModuleState {
  user: IFeedlyUserInfo | undefined;
  // TODO: merge options and filters
  options: any;
  filters: any;
}
