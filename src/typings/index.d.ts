import {
  IFeedlyNotifierBackgroundPage
} from '../scripts/background';

/* tslint:disable interface-name */
declare global {
  interface Window {
    extensionBackground: IFeedlyNotifierBackgroundPage;
  }
}
/* tslint:enable interface-name */