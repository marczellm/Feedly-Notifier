import * as browser from "webextension-polyfill";
import FeedlyApiClient from "./feedly.api";
import {
  IFeedlyAuthToken,
  IFeedlyCategory,
  IFeedlyMarkerCounts,
  IFeedlyStream,
  IFeedlySubscription,
  IFeedlyTag,
  IFeedlyUnreadCount,
  IFeedlyUserInfo,
} from "./feedly.api.models";

import {
  Browser,
  IFeedlyNotifierCategory,
  IFeedlyNotifierFeedEntry,
  IFeedlyNotifierUserCategoryFilter,
} from "./models";

export interface IFeedlyNotifierOptions {
  [key: string]: any;
  accessToken?: string; // nullable
  refreshToken?: string; // nullable
  feedlyUserId?: string; // nullable
  popupFontSize?: number;
  popupWidth?: number;
  expandedPopupWidth?: number;
  maxNumberOfFeeds?: number;
  showOldestFeedsFirst?: boolean;
  showCategories?: boolean;
  markReadOnClick?: boolean;
  expandFeeds?: boolean;
  forceUpdateFeeds?: boolean;
  abilitySaveFeeds?: boolean;
  updateInterval?: number;
  useSecureConnection?: boolean;
  enableBackgroundMode?: boolean;
  openSiteOnIconClick?: boolean;
  openFeedsInSameTab?: boolean;
  openFeedsInBackground?: boolean;
  showCounter?: boolean;
  resetCounterOnClick?: boolean;
  showDesktopNotifications?: boolean;
  maxNotificationsCount?: number;
  showBlogIconInNotifications?: boolean;
  showThumbnailInNotifications?: boolean;
  playSound?: boolean;
  isFiltersEnabled?: boolean;
  filters?: string[];
}

export interface IFeedlyNotifierBackgroundPage {
  // readonly options: IFeedlyNotifierOptions;
  // readonly isLoggedIn: boolean;
  // feedTabId?: number;

  // login(): Promise<void>;
  logout(): Promise<void>;

  // getOptions(): Promise<IFeedlyNotifierOptions>;
  // saveOptions(options: IFeedlyNotifierOptions): Promise<void>;

  getUserInfo(): Promise<IFeedlyUserInfo | undefined>;
  // getUserCategoryFilters(): Promise<IFeedlyNotifierUserCategoryFilter[]>;

  // getFeeds(forceUpdate: boolean): Promise<IFeedlyNotifierFeedEntry[]>;
  // getSavedFeeds(forceUpdate: boolean): Promise<IFeedlyNotifierFeedEntry[]>;

  // markAsRead(feedIds: string[]): Promise<void>;
  // toggleSavedFeed(feedIds: string[], saved: boolean): Promise<void>;

  // openFeedlyTab(): Promise<void>;

  // resetCounter(): Promise<void>;
}

declare let BROWSER: Browser;
declare let CLIENT_ID: string;
declare let CLIENT_SECRET: string;

const appGlobal = {
  feedlyApiClient: new FeedlyApiClient(),
  browser: BROWSER,
  feedTabId: undefined,
  icons: {
    default: {
      19: "/images/icon.png",
      38: "/images/icon38.png",
    },
    inactive: {
      19: "/images/icon_inactive.png",
      38: "/images/icon_inactive38.png",
    },
    defaultBig: "/images/icon128.png",
  },
  options: {
    _updateInterval: 10, // minutes
    _popupWidth: 380,
    _expandedPopupWidth: 650,
    markReadOnClick: true,
    accessToken: "",
    refreshToken: "",
    showDesktopNotifications: true,
    showFullFeedContent: false,
    maxNotificationsCount: 5,
    openSiteOnIconClick: false,
    feedlyUserId: "",
    abilitySaveFeeds: false,
    maxNumberOfFeeds: 20,
    forceUpdateFeeds: false,
    useSecureConnection: true,
    expandFeeds: false,
    isFiltersEnabled: false,
    openFeedsInSameTab: false,
    openFeedsInBackground: true,
    filters: [],
    showCounter: true,
    playSound: false,
    showOldestFeedsFirst: false,
    resetCounterOnClick: false,
    popupFontSize: 100, // percent
    showCategories: false,
    grayIconColorIfNoUnread: false,
    showBlogIconInNotifications: false,
    showThumbnailInNotifications: false,
    enableBackgroundMode: false,
    get updateInterval() {
      const minimumInterval = 10;
      return this._updateInterval >= minimumInterval ? this._updateInterval : minimumInterval;
    },
    set updateInterval(value) {
      this._updateInterval = value;
    },
    get popupWidth() {
      const maxValue = 750;
      const minValue = 380;
      if (this._popupWidth > maxValue) {
        return maxValue;
      }
      if (this._popupWidth < minValue) {
        return minValue;
      }
      return this._popupWidth;
    },
    set popupWidth(value) {
      this._popupWidth = value;
    },
    get expandedPopupWidth() {
      const maxValue = 750;
      const minValue = 380;
      if (this._expandedPopupWidth > maxValue) {
        return maxValue;
      }
      if (this._expandedPopupWidth < minValue) {
        return minValue;
      }
      return this._expandedPopupWidth;
    },
    set expandedPopupWidth(value) {
      this._expandedPopupWidth = value;
    },
  } as IFeedlyNotifierOptions,
  // Names of options after changes of which scheduler will be initialized
  criticalOptionNames: [
    "updateInterval",
    "accessToken",
    "showFullFeedContent",
    "openSiteOnIconClick",
    "maxNumberOfFeeds",
    "abilitySaveFeeds",
    "filters",
    "isFiltersEnabled",
    "showCounter",
    "showOldestFeedsFirst",
    "resetCounterOnClick",
    "grayIconColorIfNoUnread",
  ],
  cachedFeeds: [] as IFeedlyNotifierFeedEntry[],
  cachedSavedFeeds: [] as IFeedlyNotifierFeedEntry[],
  notifications: {} as { [key: string]: any },
  isLoggedIn: false,
  intervalIds: [] as number[],
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  getUserSubscriptionsPromise: undefined as Promise<IFeedlySubscription[]> | undefined,
  get feedlyUrl() {
    return this.options.useSecureConnection ? "https://feedly.com" : "http://feedly.com";
  },
  get savedGroup() {
    return `user/${this.options.feedlyUserId}/tag/global.saved`;
  },
  get globalGroup() {
    return `user/${this.options.feedlyUserId}/category/global.all`;
  },
  get globalUncategorized() {
    return `user/${this.options.feedlyUserId}/category/global.uncategorized`;
  },
  get syncStorage() {
    if (this.browser !== Browser.Chrome) {
      return browser.storage.local;
    } else {
      return browser.storage.sync;
    }
  },
  backgroundPermission: {
    permissions: ["background"],
  },
  allSitesPermission: {
    origins: ["<all_urls>"],
  },
};

// #Event handlers

// @if BROWSER!="firefox"
chrome.runtime.onInstalled.addListener(() => {
  console.log("chrome.runtime.onInstalled");

  readOptions()
    // Write all options in chrome storage and initialize application
    .then(() => writeOptions())
    .then(() => initialize());
});

chrome.runtime.onStartup.addListener(() => {
  console.log("chrome.runtime.onStartup");

  readOptions()
    .then(() => initialize());
});
// @endif

// @if BROWSER=="firefox"
readOptions()
  // Write all options in chrome storage and initialize application
  .then(() => writeOptions())
  .then(() => initialize());

// @endif

chrome.storage.onChanged.addListener((changes) => {
  console.log("browser.storage.onChanged()");

  let callback!: () => void;

  for (const optionName in changes) {
    if (appGlobal.criticalOptionNames.indexOf(optionName) !== -1) {
      callback = initialize;
      break;
    }
  }

  if (callback) {
    readOptions().then(() => callback());
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("chrome.tabs.onRemoved", tabId);

  if (appGlobal.feedTabId && appGlobal.feedTabId === tabId) {
    appGlobal.feedTabId = undefined;
  }
});

/* Listener for adding or removing feeds on the feedly website */
chrome.webRequest.onCompleted.addListener((details) => {
  if (details.method === "POST" || details.method === "DELETE") {
    updateCounter();
    updateFeeds();
    appGlobal.getUserSubscriptionsPromise = undefined;
  }
}, { urls: ["*://*.feedly.com/v3/subscriptions*", "*://*.feedly.com/v3/markers?*ct=feedly.desktop*"] });

/* Listener for adding or removing saved feeds */
chrome.webRequest.onCompleted.addListener((details) => {
  if (details.method === "PUT" || details.method === "DELETE") {
    updateSavedFeeds();
  }
}, { urls: ["*://*.feedly.com/v3/tags*global.saved*"] });

chrome.browserAction.onClicked.addListener(() => {
  if (appGlobal.isLoggedIn) {
    openFeedlyTab();
    if (appGlobal.options.resetCounterOnClick) {
      resetCounter();
    }
  } else {
    login();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);

  if (appGlobal.notifications[notificationId]) {
    openUrlInNewTab(appGlobal.notifications[notificationId], true);
    if (appGlobal.options.markReadOnClick) {
      markAsRead([notificationId]);
    }
  }

  appGlobal.notifications[notificationId] = undefined;
});

chrome.notifications.onButtonClicked.addListener((notificationId, button) => {
  if (button !== 0) {
    // Unknown button index
    return;
  }

  // The "Mark as read button has been clicked"
  if (appGlobal.notifications[notificationId]) {
    markAsRead([notificationId]);
    chrome.notifications.clear(notificationId);
  }

  appGlobal.notifications[notificationId] = undefined;
});

/* Sends desktop notifications */
function sendDesktopNotification(feeds: IFeedlyNotifierFeedEntry[]) {
  function createNotifications(feedsToNotifications: IFeedlyNotifierFeedEntry[], showBlogIcons: boolean, showThumbnails: boolean) {
    for (const feed of feedsToNotifications) {
      let notificationType = "basic";
      // @if BROWSER=="chrome"
      if (showThumbnails && feed.thumbnail) {
        notificationType = "image";
      }
      // @endif

      chrome.notifications.create(feed.id, {
        type: notificationType,
        title: feed.blog,
        message: feed.title,
        iconUrl: showBlogIcons ? feed.blogIcon : appGlobal.icons.defaultBig,
        // @if BROWSER=="chrome"
        imageUrl: showThumbnails ? feed.thumbnail : null,
        buttons: [
          {
            title: chrome.i18n.getMessage("MarkAsRead"),
          },
        ],
        // @endif
      } as chrome.notifications.NotificationOptions);

      appGlobal.notifications[feed.id] = feed.url;
    }
  }

  // if notifications too many, then to show only count
  let maxNotifications = appGlobal.options.maxNotificationsCount!;
  // @if BROWSER=="firefox"
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/notifications/create
  // If you call notifications.create() more than once in rapid succession,
  // Firefox may end up not displaying any notification at all.
  maxNotifications = 1;
  // @endif
  if (feeds.length > maxNotifications) {
    // We can detect only limit count of new feeds at time, but actually count of feeds may be more
    const count = feeds.length === appGlobal.options.maxNumberOfFeeds ? chrome.i18n.getMessage("many") : feeds.length.toString();

    chrome.notifications.create({
      type: "basic",
      title: chrome.i18n.getMessage("NewFeeds"),
      message: chrome.i18n.getMessage("YouHaveNewFeeds", count),
      iconUrl: appGlobal.icons.defaultBig,
    });
  } else {
    let showBlogIcons = false;
    let showThumbnails = false;

    // @if BROWSER!="firefox"
    chrome.permissions.contains({
      origins: ["<all_urls>"],
    }, (result) => {
      if (appGlobal.options.showBlogIconInNotifications && result) {
        showBlogIcons = true;
      }

      if (appGlobal.options.showThumbnailInNotifications && result) {
        showThumbnails = true;
      }

      createNotifications(feeds, showBlogIcons, showThumbnails);
    });
    // @endif

    // @if BROWSER=="firefox"
    // Firefox doesn"t support optional permissions
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1197420
    createNotifications(feeds, showBlogIcons, showThumbnails);
    // @endif
  }
}

/* Opens new tab, if tab is being opened when no active window (i.e. background mode)
 * then creates new window and adds tab in the end of it
 * url for open
 * active when is true, then tab will be active
 */
function openUrlInNewTab(url: string, active: boolean) {
  browser.windows.getAll({})
    .then((windows) => {
      if (windows.length < 1) {
        // TODO: removed return, need to test
        browser.windows.create({ focused: true });
      }

      return Promise.resolve();
    })
    .then(() => browser.tabs.create({ url, active }));
}

/* Opens new Feedly tab, if tab was already opened, then switches on it and reload. */
function openFeedlyTab(): Promise<void> {
  return browser.tabs.query({ url: `${appGlobal.feedlyUrl}/*` })
    .then((tabs) => {
      if (tabs.length < 1) {
        chrome.tabs.create({ url: appGlobal.feedlyUrl });
      } else {
        chrome.tabs.update(tabs[0].id!, { active: true });
        chrome.tabs.reload(tabs[0].id!);
      }
    });
}

/* Removes feeds from cache by feed ID */
function removeFeedFromCache(feedId: string) {
  let indexFeedForRemove;
  for (let i = 0; i < appGlobal.cachedFeeds.length; i++) {
    if (appGlobal.cachedFeeds[i].id === feedId) {
      indexFeedForRemove = i;
      break;
    }
  }

  // Remove feed from cached feeds
  if (indexFeedForRemove !== undefined) {
    appGlobal.cachedFeeds.splice(indexFeedForRemove, 1);
  }
}

/* Returns only new feeds and set date of last feed
 */
function filterByNewFeeds(feeds: IFeedlyNotifierFeedEntry[]): Promise<IFeedlyNotifierFeedEntry[]> {
  return browser.storage.local.get("lastFeedTimeTicks").then((options) => {
    let lastFeedTime;

    if (options.lastFeedTimeTicks) {
      lastFeedTime = new Date(options.lastFeedTimeTicks);
    } else {
      lastFeedTime = new Date(1971, 0, 1);
    }

    const newFeeds: IFeedlyNotifierFeedEntry[] = [];
    let maxFeedTime = lastFeedTime;

    /* tslint:disable prefer-for-of */
    for (let i = 0; i < feeds.length; i++) {
      if (feeds[i].date > lastFeedTime) {
        newFeeds.push(feeds[i]);
        if (feeds[i].date > maxFeedTime) {
          maxFeedTime = feeds[i].date;
        }
      }
    }
    /* tslint:enable prefer-for-of */
    return browser.storage.local.set({ lastFeedTimeTicks: maxFeedTime.getTime() })
      .then(() => newFeeds);
  });
}

/**
 * Authenticates the user and stores the access token to browser storage.
 */
function login(): Promise<void> {
  const state = (new Date()).getTime();
  const redirectUri = "https://olsh.github.io/Feedly-Notifier/";
  const url = appGlobal.feedlyApiClient.getMethodUrl("auth/auth", {
    response_type: "code",
    client_id: appGlobal.clientId,
    redirect_uri: redirectUri,
    scope: "https://cloud.feedly.com/subscriptions",
    state,
  }, appGlobal.options.useSecureConnection!);

  return browser.tabs.create({ url }).then(() => {
    chrome.tabs.onUpdated.addListener(function processCode(tabId, information) {
      const checkStateRegex = new RegExp(`state=${state}`);
      if (!checkStateRegex.test(information.url!)) {
        return;
      }

      const codeParse = /code=(.+?)(?:&|$)/i;
      const matches = codeParse.exec(information.url!);
      if (matches) {
        appGlobal.feedlyApiClient.request("auth/token", {
          method: "POST",
          useSecureConnection: appGlobal.options.useSecureConnection,
          parameters: {
            code: matches[1],
            client_id: appGlobal.clientId,
            client_secret: appGlobal.clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          },
        }).then((response: IFeedlyAuthToken) => {
          appGlobal.syncStorage.set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            feedlyUserId: response.id,
          }).then(() => {
            chrome.tabs.onUpdated.removeListener(processCode);
            console.log("access token saved");
          });
        });
      }
    });
  });
}

/**
 * Logout authenticated user
 * @returns {Promise}
 */
function logout(): Promise<void> {
  appGlobal.options.accessToken = "";
  appGlobal.options.refreshToken = "";
  return appGlobal.syncStorage.remove(["accessToken", "refreshToken"]);
}

/* Sets badge counter if unread feeds more than zero */
function setBadgeCounter(unreadFeedsCount: number): Promise<void> {
  console.log("setBadgeCounter()");
  if (appGlobal.options.showCounter) {
    chrome.browserAction.setBadgeText({ text: String(+unreadFeedsCount > 0 ? unreadFeedsCount : "") });
  } else {
    chrome.browserAction.setBadgeText({ text: "" });
  }

  if (!unreadFeedsCount && appGlobal.options.grayIconColorIfNoUnread) {
    chrome.browserAction.setIcon({ path: appGlobal.icons.inactive });
  } else {
    chrome.browserAction.setIcon({ path: appGlobal.icons.default });
  }

  return Promise.resolve();
}

function resetCounter(): Promise<void> {
  console.log("resetCounter()");
  setBadgeCounter(0);
  return browser.storage.local.set({ lastCounterResetTime: new Date().getTime() });
}

/* Writes all application options in chrome storage and runs callback after it */
function writeOptions(): Promise<void> {
  console.log("writeOptions()");

  const options: IFeedlyNotifierOptions = {};

  for (const option in appGlobal.options) {
    options[option] = appGlobal.options[option];
  }

  return appGlobal.syncStorage.set(options);
}

/* Plays alert sound */
function playSound(): Promise<void> {
  const audio = new Audio("sound/alert.mp3");
  return audio.play();
}

function stopSchedule() {
  appGlobal.intervalIds.forEach((intervalId) => {
    clearInterval(intervalId);
  });
  appGlobal.intervalIds = [];
}

function startSchedule(updateInterval: number) {
  stopSchedule();
  updateCounter();
  updateFeeds();
  if (appGlobal.options.showCounter) {
    appGlobal.intervalIds.push(setInterval(updateCounter, updateInterval * 60000));
  }
  if (appGlobal.options.showDesktopNotifications || appGlobal.options.playSound || !appGlobal.options.openSiteOnIconClick) {
    appGlobal.intervalIds.push(setInterval(updateFeeds, updateInterval * 60000));
  }
}

/* Sets badge as active */
function setActiveStatus() {
  console.log("setActiveStatus()");
  chrome.browserAction.setBadgeBackgroundColor({ color: "#CF0016" });
  appGlobal.isLoggedIn = true;
}

/* Stops scheduler, sets badge as inactive and resets counter */
function setInactiveStatus() {
  console.log("setInactiveStatus()");
  chrome.browserAction.setIcon({ path: appGlobal.icons.inactive });
  chrome.browserAction.setBadgeText({ text: "" });
  appGlobal.cachedFeeds = [];
  appGlobal.isLoggedIn = false;
  stopSchedule();
}

/* Reads all options from chrome storage and runs callback after it */
function readOptions(): Promise<void> {
  console.log("readOptions()");

  return appGlobal.syncStorage.get().then((options) => {
    for (const optionName in options) {
      if (typeof appGlobal.options[optionName] === "boolean") {
        appGlobal.options[optionName] = Boolean(options[optionName]);
      } else if (typeof appGlobal.options[optionName] === "number") {
        appGlobal.options[optionName] = Number(options[optionName]);
      } else {
        appGlobal.options[optionName] = options[optionName];
      }
    }
  });
}

/* Retrieves authenticated user profile info
  * @returns {Promise}
*/
function getUserInfo(): Promise<IFeedlyUserInfo | undefined> {
  console.log("background.getUserInfo()");
  return apiRequestWrapper("profile", { useSecureConnection: appGlobal.options.useSecureConnection })
    .then((userInfo: IFeedlyUserInfo) => userInfo)
    .catch((reason) => {
      console.log(reason);
      return undefined;
    });
}

function getOptions(): Promise<IFeedlyNotifierOptions> {
  const options: IFeedlyNotifierOptions = {};

  return new Promise((resolveOptions) => {
    appGlobal.syncStorage.get().then((items) => {
      for (const option in items) {
        options[option] = items[option];
      }
      const promises: Array<Promise<boolean>> = [];

      // @if BROWSER=="chrome"
      const getBackgroundPermissionPromise = new Promise<boolean>((resolveBackgroundMode) => {
        try {
          chrome.permissions.contains(appGlobal.backgroundPermission, (enabled) => {
            resolveBackgroundMode(enabled);
          });
        } catch (err) {
          resolveBackgroundMode(false);
        }
      });
      promises.push(getBackgroundPermissionPromise);
      // @endif

      // @if BROWSER!="firefox"
      const getAllSitesPermissionPromise = new Promise<boolean>((resolveAllSitesPermission) => {
        chrome.permissions.contains(appGlobal.allSitesPermission, (enabled) => {
          resolveAllSitesPermission(enabled);
        });
      });
      promises.push(getAllSitesPermissionPromise);
      // @endif

      Promise.all(promises).then((results) => {
        options.enableBackgroundMode = results[0];
        options.showBlogIconInNotifications = results[1] && options.showBlogIconInNotifications;
        options.showThumbnailInNotifications = results[1] && options.showThumbnailInNotifications;

        resolveOptions(options);
      });
    });
  });
}

function saveOptions(options: IFeedlyNotifierOptions): Promise<void> {
  return new Promise((resolveOptions) => {
    appGlobal.syncStorage.set(options).then(() => {
      const promises = [];
      // @if BROWSER=="chrome"
      // request/remove background permission
      const setBackgroundPermissionPromise = new Promise((resolveBackgroundMode) => {
        if (options.enableBackgroundMode) {
          chrome.permissions.request(appGlobal.backgroundPermission, () => {
            resolveBackgroundMode();
          });
        } else {
          chrome.permissions.remove(appGlobal.backgroundPermission, () => {
            resolveBackgroundMode();
          });
        }
      });
      promises.push(setBackgroundPermissionPromise);
      // @endif
      // request all urls permission
      const setAllSitesPermissionPromise = new Promise((resolveAllSitesPermission) => {
        const isAllSitesPermissionRequired = options.showBlogIconInNotifications || options.showThumbnailInNotifications;

        if (isAllSitesPermissionRequired) {
          chrome.permissions.request(appGlobal.allSitesPermission, (granted) => {
            resolveAllSitesPermission(granted);
          });
        } else {
          resolveAllSitesPermission(false);
        }
      });
      promises.push(setAllSitesPermissionPromise);

      Promise.all(promises).then(() => { resolveOptions(); });
    });
  });
}

function apiRequestWrapper(methodName: string, settings?: any): Promise<any> {
  if (!appGlobal.options.accessToken) {
    setInactiveStatus();

    return Promise.reject("unauthorized");
  }

  settings = settings || {};
  settings.useSecureConnection = appGlobal.options.useSecureConnection;

  return appGlobal.feedlyApiClient.request(methodName, settings)
    .then((response: Promise<any>) => {
      setActiveStatus();
      return response;
    })
    .catch((response: Response) => {
      if (response && response.status === 401) {
        return refreshAccessToken();
      }

      return Promise.reject("unauthorized");
    });
}

/**
 * TODO: remove function
 * Retrieves user categories
 * @returns {Promise}
 */
const getUserCategoryFilters = () => Promise.all([
  apiRequestWrapper("categories") as Promise<IFeedlyCategory[]>,
  appGlobal.syncStorage.get("filters"),
])
  .then((results) => {
    const categories: IFeedlyCategory[] = results[0].concat({
      id: appGlobal.globalUncategorized,
      label: "Uncategorized",
    });
    const filters: string[] = results[1] && results[1].filters || [];
    return categories.map<IFeedlyNotifierUserCategoryFilter>((category) => ({
      id: category.id,
      label: category.label,
      checked: filters.indexOf(category.id) !== -1,
    }));
  })
  .catch(() => [] as IFeedlyNotifierUserCategoryFilter[]);

//  function getUserCategoryFilters(): Promise<IFeedlyCategoryFilter[]> {
//   return apiRequestWrapper("categories")
//     .then((categories: IFeedlyCategory[]) => {
//       return categories.concat({
//         id: appGlobal.globalUncategorized,
//         label: "Uncategorized",
//       });
//     })
//     .then((categories: IFeedlyCategory[]) => {
//       appGlobal.syncStorage.get("filters").then((items) => {
//         const filters: string[] = items.filters || [];

//         return categories.map<IFeedlyCategoryFilter>((category) => {
//           return {
//             id: category.id,
//             label: category.label,
//             checked: filters.indexOf(category.id) !== -1,
//           };
//         });
//       });
//       return categories;
//     })
//     .catch(() => []) as Promise<IFeedlyCategoryFilter[]>;
// }

/* Marks feed as read, remove it from the cache and decrement badge.
 * array of the ID of feeds
 * The callback parameter should specify a function that looks like this:
 * function(boolean isLoggedIn) {...};
 */
function markAsRead(feedIds: string[]): Promise<void> {
  return apiRequestWrapper("markers", {
    body: {
      action: "markAsRead",
      type: "entries",
      entryIds: feedIds,
    },
    method: "POST",
  }).then(() => {
    // TODO: refactor removeFeedFromCache method
    // TODO: remove for in loop after refactoring
    for (const id in feedIds) {
      removeFeedFromCache(id);
    }

    chrome.browserAction.getBadgeText({}, (feedsCount) => {
      let count = +feedsCount;
      if (count > 0) {
        count -= feedIds.length;
        setBadgeCounter(count);
      }
    });
  });
}

/* Save feed or unsave it.
 * array of the feeds IDs
 * if saveFeed is true, then save the feeds, else unsafe them
 * The callback parameter should specify a function that looks like this:
 * function(boolean isLoggedIn) {...};
 */
function toggleSavedFeed(feedsIds: string[], saveFeed: boolean): Promise<void> {
  if (saveFeed) {
    apiRequestWrapper(`tags/${encodeURIComponent(appGlobal.savedGroup)}`, {
      method: "PUT",
      body: {
        entryIds: feedsIds,
      },
    });
  } else {
    apiRequestWrapper(`tags/${encodeURIComponent(appGlobal.savedGroup)}/${encodeURIComponent(feedsIds.join(","))}`, {
      method: "DELETE",
    });
  }

  // Update state in the cache

  /* tslint:disable prefer-for-of */
  for (let i = 0; i < feedsIds.length; i++) {
    const feedId = feedsIds[i];
    for (let j = 0; j < appGlobal.cachedFeeds.length; j++) {
      if (appGlobal.cachedFeeds[j].id === feedId) {
        appGlobal.cachedFeeds[j].isSaved = saveFeed;
        break;
      }
    }
  }
  /* tslint:enable prefer-for-of */

  return Promise.resolve();
}

function getUserSubscriptions(updateCache?: boolean): Promise<IFeedlySubscription[]> {
  if (updateCache) {
    appGlobal.getUserSubscriptionsPromise = undefined;
  }

  appGlobal.getUserSubscriptionsPromise =
    appGlobal.getUserSubscriptionsPromise
    ||
    apiRequestWrapper("subscriptions")
      .then((response) => {
        if (!response) {
          appGlobal.getUserSubscriptionsPromise = undefined;
          return Promise.reject("unauthorized");
        }
        return response;
      }).catch(() => {
        appGlobal.getUserSubscriptionsPromise = undefined;
        return Promise.reject("unauthorized");
      });

  return appGlobal.getUserSubscriptionsPromise as Promise<IFeedlySubscription[]>;
}

function makeMarkersRequest(parameters?: any): Promise<void> {
  return apiRequestWrapper("markers/counts", { parameters }).then((markersResponse: IFeedlyMarkerCounts) => {
    const unreadCounts = markersResponse.unreadcounts;
    let unreadFeedsCount = 0;

    if (appGlobal.options.isFiltersEnabled) {
      return getUserSubscriptions().then((subscriptionsResponse) => {
        unreadCounts.forEach((element) => {
          if (appGlobal.options.filters!.indexOf(element.id) !== -1) {
            unreadFeedsCount += element.count;
          }
        });

        // When feed consists in more than one category, we remove feed which was counted twice or more
        subscriptionsResponse.forEach((feed) => {
          let numberOfDupesCategories = 0;
          feed.categories.forEach((category) => {
            if (appGlobal.options.filters!.indexOf(category.id) !== -1) {
              numberOfDupesCategories++;
            }
          });
          if (numberOfDupesCategories > 1) {
            /* tslint:disable prefer-for-of */
            for (let i = 0; i < unreadCounts.length; i++) {
              if (feed.id === unreadCounts[i].id) {
                unreadFeedsCount -= unreadCounts[i].count * --numberOfDupesCategories;
                break;
              }
            }
            /* tslint:enable prefer-for-of */
          }
        });

        return unreadFeedsCount;
      }).catch(() => {
        /* tslint:disable no-console */
        console.info("Unable to load subscriptions.");
        /* tslint:enable no-console */
        return 0;
      });
    }

    for (const unreadCount of unreadCounts) {
      if (appGlobal.globalGroup === unreadCount.id) {
        unreadFeedsCount = unreadCount.count;
        break;
      }
    }

    return unreadFeedsCount;
  }).then((unreadCount: number) => setBadgeCounter(unreadCount))
    .catch(() => {
      chrome.browserAction.setBadgeText({ text: "" });
      /* tslint:disable no-console */
      console.info("Unable to load counters.");
      /* tslint:enable no-console */
    });
}

/* Runs feeds update and stores unread feeds in cache
 * Callback will be started after function complete
 * */
function updateCounter() {
  if (appGlobal.options.resetCounterOnClick) {
    browser.storage.local.get("lastCounterResetTime").then((options) => {
      let parameters = null;
      if (options.lastCounterResetTime) {
        parameters = {
          newerThan: options.lastCounterResetTime,
        };
      }
      makeMarkersRequest(parameters);
    });
  } else {
    browser.storage.local.set({ lastCounterResetTime: new Date(0).getTime() });
    makeMarkersRequest();
  }
}

/* Converts feedly response to feeds */
function parseFeeds(feedlyResponse: IFeedlyStream): Promise<IFeedlyNotifierFeedEntry[]> {
  return getUserSubscriptions().then((subscriptionResponse) => {
    const subscriptionsMap: { [key: string]: string } = {};
    subscriptionResponse.forEach((item) => { subscriptionsMap[item.id] = item.title; });

    return feedlyResponse.items.map((item) => {
      let blogUrl: string | undefined;
      try {
        if (item.origin) {
          const matches = item.origin.htmlUrl.match(/http(?:s)?:\/\/[^/]+/i);
          if (matches) {
            blogUrl = matches.pop();
          }
        }
      } catch (exception) {
        blogUrl = "#";
      }

      // Set content
      let content: string = "";
      let contentDirection;
      if (appGlobal.options.showFullFeedContent) {
        if (item.content !== undefined) {
          content = item.content.content;
          contentDirection = item.content.direction;
        }
      }

      if (!content) {
        if (item.summary !== undefined) {
          content = item.summary.content;
          contentDirection = item.summary.direction;
        }
      }

      // Set title
      let title: string = "";
      let titleDirection;
      if (item.title) {
        if (item.title.indexOf("direction:rtl") !== -1) {
          // Feedly wraps rtl titles in div, we remove div because desktopNotification supports only text
          title = item.title.replace(/<\/?div.*?>/gi, "");
          titleDirection = "rtl";
        } else {
          title = item.title;
        }
      }

      let isSaved: boolean = false;
      if (item.tags) {
        isSaved = item.tags.some((tag) => tag.id.search(/global\.saved$/i) !== -1);
      }

      let blog;
      let blogTitleDirection;
      if (item.origin) {
        // Trying to get the user defined name of the stream
        blog = subscriptionsMap[item.origin.streamId] || item.origin.title;

        if (blog.indexOf("direction:rtl") !== -1) {
          // Feedly wraps rtl titles in div, we remove div because desktopNotifications support only text
          blog = item.origin.title.replace(/<\/?div.*?>/gi, "");
          blogTitleDirection = "rtl";
        }
      }

      let categories: IFeedlyNotifierCategory[] = [];
      if (item.categories) {
        categories = item.categories.map((category) => ({
          id: category.id,
          encodedId: encodeURI(category.id),
          label: category.label,
        }));
      }

      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${blogUrl}&alt=feed`;

      let engagement;
      if (item.engagement) {
        engagement = item.engagement > 1000 ? Math.trunc(item.engagement / 1000) : item.engagement;
      }

      const entry: IFeedlyNotifierFeedEntry = {
        title,
        titleDirection,
        url: (item.alternate ? item.alternate[0] ? item.alternate[0].href : "" : "") || blogUrl || "",
        blog,
        blogTitleDirection,
        blogUrl,
        blogIcon: `https://i.olsh.me/icon?url=${blogUrl}&size=16..64..300&fallback_icon_url=${googleFaviconUrl}`,
        id: item.id,
        content,
        contentDirection,
        isoDate: item.crawled ? new Date(item.crawled).toISOString() : "",
        date: new Date(item.crawled),
        isSaved,
        categories,
        author: item.author,
        thumbnail: item.thumbnail && item.thumbnail.length > 0 && item.thumbnail[0].url ? item.thumbnail[0].url : undefined,
        showEngagement: (item.engagement && item.engagement > 0) as boolean,
        engagement,
        engagementPostfix: engagement && engagement > 1000 ? "K" : "",
        isEngagementHot: (engagement && engagement >= 5000 && engagement < 100000) as boolean,
        isEngagementOnFire: (engagement && engagement >= 100000) as boolean,
      };

      return entry;
    });
  });
}

/* Runs feeds update and stores unread feeds in cache
 * Callback will be started after function complete
 * If silentUpdate is true, then notifications will not be shown
 *  */
function updateFeeds(silentUpdate?: boolean) {
  appGlobal.cachedFeeds = [];
  appGlobal.options.filters = appGlobal.options.filters || [];

  const streamIds = appGlobal.options.isFiltersEnabled && appGlobal.options.filters.length
    ? appGlobal.options.filters
    : [appGlobal.globalGroup];

  const promises: Array<Promise<IFeedlyStream>> = [];
  /* tslint:disable prefer-for-of */
  for (let i = 0; i < streamIds.length; i++) {
    const promise = apiRequestWrapper(`streams/${encodeURIComponent(streamIds[i])}/contents`, {
      timeout: 10000, // Prevent infinite loading
      parameters: {
        unreadOnly: true,
        count: appGlobal.options.maxNumberOfFeeds,
        ranked: appGlobal.options.showOldestFeedsFirst ? "oldest" : "newest",
      },
    }) as Promise<IFeedlyStream>;

    promises.push(promise);
  }
  /* tslint:enable prefer-for-of */

  return Promise.all(promises).then((responses) => {
    const parsePromises = responses.map((response) => parseFeeds(response));

    return Promise.all(parsePromises);
  }).then((parsedFeeds) => {
    parsedFeeds.forEach((parsedFeed) => {
      appGlobal.cachedFeeds = appGlobal.cachedFeeds.concat(parsedFeed);
    });

    // Remove duplicates
    appGlobal.cachedFeeds = appGlobal.cachedFeeds.filter((value, index, feeds) => {
      for (let i = ++index; i < feeds.length; i++) {
        if (feeds[i].id === value.id) {
          return false;
        }
      }
      return true;
    });

    appGlobal.cachedFeeds = appGlobal.cachedFeeds.sort((a, b) => {
      if (a.date > b.date) {
        return appGlobal.options.showOldestFeedsFirst ? 1 : -1;
      } else if (a.date < b.date) {
        return appGlobal.options.showOldestFeedsFirst ? -1 : 1;
      }
      return 0;
    });

    appGlobal.cachedFeeds = appGlobal.cachedFeeds.splice(0, appGlobal.options.maxNumberOfFeeds);
    if (!silentUpdate
      &&
      (appGlobal.options.showDesktopNotifications || appGlobal.options.playSound)
    ) {
      filterByNewFeeds(appGlobal.cachedFeeds).then((newFeeds) => {
        if (appGlobal.options.showDesktopNotifications) {
          sendDesktopNotification(newFeeds);
        }
        if (appGlobal.options.playSound && newFeeds.length > 0) {
          playSound();
        }
      });
    }
  })
    .catch(() => {
      /* tslint:disable no-console */
      console.info("Unable to update feeds.");
      /* tslint:enable no-console */
    });
}

/* Returns feeds from the cache.
 * If the cache is empty, then it will be updated before return
 * forceUpdate, when is true, then cache will be updated
 */
function getFeeds(forceUpdate?: boolean): Promise<IFeedlyNotifierFeedEntry[]> {
  console.log("background.getFeeds()");
  if (appGlobal.cachedFeeds.length > 0 && !forceUpdate) {
    return Promise.resolve(appGlobal.cachedFeeds.slice(0));
  } else {
    return updateFeeds(true)
      .then(() => updateCounter())
      .then(() => appGlobal.cachedFeeds.slice(0));
  }
}

/**
 * Updates saved feeds and stores them in cache.
 * @returns {Promise}
 */
function updateSavedFeeds(): Promise<void> {
  return apiRequestWrapper(`streams/${encodeURIComponent(appGlobal.savedGroup)}/contents`)
    .then((response: IFeedlyStream) => parseFeeds(response))
    .then((feeds) => {
      appGlobal.cachedSavedFeeds = feeds;
    });
}

/* Returns saved feeds from the cache.
 * If the cache is empty, then it will be updated before return
 * forceUpdate, when is true, then cache will be updated
 */
function getSavedFeeds(forceUpdate: boolean): Promise<IFeedlyNotifierFeedEntry[]> {
  if (appGlobal.cachedSavedFeeds.length > 0 && !forceUpdate) {
    return Promise.resolve(appGlobal.cachedSavedFeeds.slice(0));
  } else {
    return updateSavedFeeds().then(() => appGlobal.cachedSavedFeeds.slice(0));
  }
}

/* Initialization all parameters and run feeds check */
function initialize() {
  console.log("initialize()");

  if (appGlobal.options.openSiteOnIconClick) {
    chrome.browserAction.setPopup({ popup: "" });
  } else {
    chrome.browserAction.setPopup({ popup: "popup.html" });
  }
  appGlobal.feedlyApiClient.accessToken = appGlobal.options.accessToken;

  startSchedule(appGlobal.options.updateInterval!);
}

/**
 * Refreshes the access token.
 */
function refreshAccessToken() {
  if (!appGlobal.options.refreshToken) {
    setInactiveStatus();

    return Promise.reject("unauthorized");
  }

  return appGlobal.feedlyApiClient.request("auth/token", {
    method: "POST",
    useSecureConnection: appGlobal.options.useSecureConnection,
    parameters: {
      refresh_token: appGlobal.options.refreshToken,
      client_id: appGlobal.clientId,
      client_secret: appGlobal.clientSecret,
      grant_type: "refresh_token",
    },
  }).then((response: IFeedlyAuthToken) => {
    appGlobal.syncStorage.set({
      accessToken: response.access_token,
      feedlyUserId: response.id,
    });
  }, (response: Response) => {
    // If the refresh token is invalid
    if (response && response.status === 403) {
      setInactiveStatus();
    }

    return Promise.reject("unauthorized");
  });
}

class Background implements IFeedlyNotifierBackgroundPage {

  public options = appGlobal.options;
  public get isLoggedIn() {
    return appGlobal.isLoggedIn;
  }

  public get feedTabId() {
    return appGlobal.feedTabId;
  }

  public login = login;
  public logout = logout;

  public getOptions = getOptions;
  public saveOptions = saveOptions;

  public resetCounter = resetCounter;

  /* Retrieves authenticated user profile info
  * @returns {Promise}
  */
  public getUserInfo = getUserInfo;
  public getUserCategoryFilters = getUserCategoryFilters;

  public getFeeds = getFeeds;
  public getSavedFeeds = getSavedFeeds;
  public toggleSavedFeed = toggleSavedFeed;

  public markAsRead = markAsRead;

  public openFeedlyTab = openFeedlyTab;
}

// public API for popup and options
window.extensionBackground = new Background();
