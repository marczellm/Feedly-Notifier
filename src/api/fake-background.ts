/*

This is used only for development purposes.
Webpack replaces imports of "api/background" to "api/fake-background" in development environment

*/

import { IFeedlyNotifierBackgroundPage } from "src/scripts/background";
import { IFeedlyUserInfo } from "src/scripts/feedly.api.models";

class Background implements IFeedlyNotifierBackgroundPage {

  private state = {
    user: {
      id: "",
      email: "user@feedly.com",
      fullName: "Feedly Notifier",
      picture: "https://upload.wikimedia.org/wikipedia/commons/5/56/Feedly-logo.png",
    } as IFeedlyUserInfo | undefined,
  };

  public logout(): Promise<void> {
    console.log("fake.logout");
    this.state.user = undefined;
    return Promise.resolve();
  }

  public getUserInfo(): Promise<IFeedlyUserInfo | undefined> {
    console.log("fake.getUserInfo");
    return Promise.resolve(this.state.user);
  }
}

const instance = new Background();
export default instance;
