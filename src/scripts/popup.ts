import * as DOMPurify from "dompurify";
import * as $ from "jquery";
import * as Mustache from "mustache";
import timeago from "timeago.js";
import "timeago.js/locales/locales";

import {
  IFeedlyCategory,
  IFeedlyNotifierFeedEntry,
} from "./background";

const popupGlobal = {
  feeds: [] as IFeedlyNotifierFeedEntry[],
  savedFeeds: [] as IFeedlyNotifierFeedEntry[],
  backgroundPage: chrome.extension.getBackgroundPage()!.extensionBackground,
};

const showLoader = () => {
  $("body").children("div").hide();
  $("#loading").show();
};

const showLogin = () => {
  $("body").children("div").hide();
  $("#login-btn").text(chrome.i18n.getMessage("Login"));
  $("#login").show();
};

const showEmptyContent = () => {
  $("body").children("div").hide();
  $("#popup-content").show().children("div").hide()
    .filter("#feed-empty")
    .text(chrome.i18n.getMessage("NoUnreadArticles"))
    .show();
  $("#feedly").show().find("#popup-actions").hide();
};

const setPopupExpand = (isExpand: boolean) => {
  if (isExpand) {
    $("#feed, #feed-saved").width(popupGlobal.backgroundPage.options.expandedPopupWidth!);
  } else {
    $("#feed, #feed-saved").width(popupGlobal.backgroundPage.options.popupWidth!);
  }
};

const showFeeds = () => {
  if (popupGlobal.backgroundPage.options.resetCounterOnClick) {
    popupGlobal.backgroundPage.resetCounter();
  }
  $("body").children("div").hide();
  $("#popup-content").show().children("div").hide()
    .filter("#feed")
    .show();
  $("#feedly")
    .show()
    .find("#popup-actions")
    .show()
    .children()
    .show();
  $(".mark-read").attr("title", chrome.i18n.getMessage("MarkAsRead"));
  $(".show-content").attr("title", chrome.i18n.getMessage("More"));
  $("#feedly").show().find("#popup-actions").show()
    .children()
    .filter(".icon-unsaved")
    .hide();
};

const showSavedFeeds = () => {
  $("body").children("div").hide();
  $("#popup-content").show().children("div").hide()
    .filter("#feed-saved")
    .show()
    .find(".mark-read")
    .hide();
  $("#feed-saved").find(".show-content").attr("title", chrome.i18n.getMessage("More"));
  $("#feedly").show().find("#popup-actions").show()
    .children()
    .hide();
  $("#feedly").show().find("#popup-actions").show()
    .children()
    .filter(".icon-unsaved")
    .show();
  $("#feedly").show().find("#popup-actions").show()
    .children()
    .filter(".icon-refresh")
    .show();
};

const executeAsync = (func: () => void) => {
  chrome.runtime.getPlatformInfo((platformInfo) => {
    let timeout = 0;

    // Workaround for the bug: https://bugs.chromium.org/p/chromium/issues/detail?id=307912
    if (platformInfo.os === "mac") {
      timeout = 150;
    }

    setTimeout(() => {
      func();
    }, timeout);
  });
};

const renderTimeAgo = () => {
  const timeagoInstance = timeago();
  const timeagoNodes = document.querySelectorAll(".timeago");
  timeagoInstance.render(timeagoNodes, window.navigator.language);
};

const getUniqueCategories = (feeds: IFeedlyNotifierFeedEntry[]) => {
  const categories: IFeedlyCategory[] = [];
  const addedIds: string[] = [];
  feeds.forEach((feed) => {
    feed.categories.forEach((category) => {
      if (addedIds.indexOf(category.id) === -1) {
        categories.push(category);
        addedIds.push(category.id);
      }
    });
  });
  return categories;
};

const renderCategories = (container: JQuery<HTMLElement>, feeds: IFeedlyNotifierFeedEntry[]) => {
  $(".categories").remove();
  const categories = getUniqueCategories(feeds);
  const template = $("#categories-template").html();
  Mustache.parse(template);
  container.append(Mustache.render(template, { categories }));
};

const renderFeeds = (forceUpdate?: boolean) => {
  showLoader();
  const requireForceUpdate = popupGlobal.backgroundPage.options.forceUpdateFeeds || forceUpdate || false;
  popupGlobal.backgroundPage
    .getFeeds(requireForceUpdate)
    .then((feeds) => {
      popupGlobal.feeds = feeds;
      if (!popupGlobal.backgroundPage.isLoggedIn) {
        showLogin();
        return;
      }

      if (feeds.length === 0) {
        showEmptyContent();
      } else {
        const container = $("#feed").show().empty();

        if (popupGlobal.backgroundPage.options.showCategories) {
          renderCategories(container, feeds);
        }

        const feedsTemplate = $("#feedTemplate").html();
        Mustache.parse(feedsTemplate);

        container.append(Mustache.render(feedsTemplate, { feeds }));
        renderTimeAgo();

        showFeeds();

        if (popupGlobal.backgroundPage.options.expandFeeds) {
          container.find(".show-content").click();
        }
      }
    });
};

const renderSavedFeeds = (forceUpdate?: boolean) => {
  showLoader();
  const requireForceUpdate = popupGlobal.backgroundPage.options.forceUpdateFeeds || forceUpdate || false;
  popupGlobal.backgroundPage
    .getSavedFeeds(requireForceUpdate)
    .then((feeds) => {
      popupGlobal.savedFeeds = feeds;
      if (!popupGlobal.backgroundPage.isLoggedIn) {
        showLogin();
        return;
      }

      if (feeds.length === 0) {
        showEmptyContent();
      } else {
        const container = $("#feed-saved").empty();

        if (popupGlobal.backgroundPage.options.showCategories) {
          renderCategories(container, feeds);
        }

        const feedTemplate = $("#feedTemplate").html();
        Mustache.parse(feedTemplate);

        container.append(Mustache.render(feedTemplate, { feeds }));
        renderTimeAgo();

        showSavedFeeds();

        if (popupGlobal.backgroundPage.options.expandFeeds) {
          container.find(".show-content").click();
        }
      }
    });
};

const markAsRead = (feedIds: string[]) => {
  let feedItems = $();
  for (const id in feedIds) {
    feedItems = feedItems.add(`.item[data-id='${id}']`);
  }

  feedItems.fadeOut("fast", function(this) {
    $(this).remove();
  });

  feedItems.attr("data-is-read", "true");

  // Show loader if all feeds were read
  if ($("#feed").find(".item[data-is-read!='true']").length === 0) {
    showLoader();
  }
  popupGlobal.backgroundPage
    .markAsRead(feedIds)
    .then(() => {
      if ($("#feed").find(".item[data-is-read!='true']").length === 0) {
        renderFeeds();
      }
    });
};

const markAsUnSaved = (feedIds: string[]) => {
  let feedItems = $();
  for (const id in feedIds) {
    feedItems = feedItems.add(`.item[data-id='${id}']`);
  }

  popupGlobal.backgroundPage.toggleSavedFeed(feedIds, false);

  feedItems.data("saved", false);
  feedItems.find(".saved").removeClass("saved");
};

const markAllAsRead = () => {
  const feedIds: string[] = [];
  $(".item:visible").each((key, value) => {
    feedIds.push($(value).data("id"));
  });
  markAsRead(feedIds);
};

const markAllAsUnsaved = () => {
  const feedIds: string[] = [];
  $(".item:visible").each((key, value) => {
    feedIds.push($(value).data("id"));
  });
  markAsUnSaved(feedIds);
};

$(document).ready(() => {
  $("#feed, #feed-saved").css("font-size", `${popupGlobal.backgroundPage.options.popupFontSize! / 100}em`);
  $("#website").text(chrome.i18n.getMessage("FeedlyWebsite"));
  $("#mark-all-read>span").text(chrome.i18n.getMessage("MarkAllAsRead"));
  $("#update-feeds>span").text(chrome.i18n.getMessage("UpdateFeeds"));
  $("#open-all-news>span").text(chrome.i18n.getMessage("OpenAllFeeds"));
  $("#open-unsaved-all-news>span").text(chrome.i18n.getMessage("OpenAllSavedFeeds"));

  if (popupGlobal.backgroundPage.options.abilitySaveFeeds) {
    $("#popup-content").addClass("tabs");
  }

  setPopupExpand(false);

  executeAsync(renderFeeds);
});

$("#login").click(() => {
  popupGlobal.backgroundPage.login();
});

// using "mousedown" instead of "click" event to process middle button click.
$("#feed, #feed-saved").on("mousedown", "a", (event) => {
  const link = $(event.target);
  const onOpenCallback = (isFeed: boolean, tab: chrome.tabs.Tab) => {
    if (isFeed) {
      popupGlobal.backgroundPage.feedTabId = tab.id;

      if (popupGlobal.backgroundPage.options.markReadOnClick) {
        markAsRead([link.closest(".item").data("id")]);
      }
    }
  };

  if (event.which === 1 || event.which === 2) {
    const isActiveTab = !(event.ctrlKey || event.which === 2) &&
      !popupGlobal.backgroundPage.options.openFeedsInBackground;
    const isFeed = link.hasClass("title") && $("#feed").is(":visible");
    const url = link.data("link");

    if (isFeed &&
        popupGlobal.backgroundPage.feedTabId &&
        popupGlobal.backgroundPage.options.openFeedsInSameTab
    ) {
      chrome.tabs.update(popupGlobal.backgroundPage.feedTabId, { url }, (tab) => {
        onOpenCallback(isFeed, tab!);
      });
    } else {
      chrome.tabs.create({ url, active: isActiveTab }, (tab) => {
        onOpenCallback(isFeed, tab);
      });
    }
  }
});

$("#popup-content").on("click", "#mark-all-read", markAllAsRead);

$("#popup-content").on("click", "#open-all-news", () => {
  $("#feed").find("a.title[data-link]").filter(":visible").each((key, value) => {
    const news = $(value);
    chrome.tabs.create({ url: news.data("link"), active: false });
  });
  if (popupGlobal.backgroundPage.options.markReadOnClick) {
    markAllAsRead();
  }
});

$("#popup-content").on("click", "#open-unsaved-all-news", () => {
  $("#feed-saved").find("a.title[data-link]").filter(":visible").each((key, value) => {
    const news = $(value);
    chrome.tabs.create({ url: news.data("link"), active: false });
  });
  markAllAsUnsaved();
});

$("#feed").on("click", ".mark-read", (event) => {
  const feed = $(event.target).closest(".item");
  markAsRead([feed.data("id")]);
});

$("#feedly").on("click", "#btn-feeds-saved", (event) => {
  $(event.target).addClass("active-tab");
  $("#btn-feeds").removeClass("active-tab");
  renderSavedFeeds();
});

$("#feedly").on("click", "#btn-feeds", (event) => {
  $(event.target).addClass("active-tab");
  $("#btn-feeds-saved").removeClass("active-tab");
  renderFeeds();
});

$("#popup-content").on("click", ".show-content", (event) => {
  const $this = $(event.target);
  const feedItem = $this.closest(".item");
  const contentContainer = feedItem.find(".content");
  const feedId = feedItem.data("id");

  if (!contentContainer.html()) {
    const feeds = $("#feed").is(":visible") ? popupGlobal.feeds : popupGlobal.savedFeeds;
    const template = $("#feed-content").html();
    Mustache.parse(template);
    feeds.forEach((feed) => {
      if (feed.id === feedId) {
        // @if BROWSER=='firefox'
        // We should sanitize the content of feeds because of AMO review.
        feed.title = DOMPurify.sanitize(feed.title);
        feed.content = DOMPurify.sanitize(feed.content);
        // @endif

        contentContainer.html(Mustache.render(template, feed));

        // For open new tab without closing popup
        contentContainer.find("a").each((key, value) => {
          const link = $(value);
          link.data("link", link.attr("href"));
          link.attr("href", "javascript:void(0)");
        });
      }
    });
  }
  contentContainer.slideToggle("fast", () => {
    $this.toggleClass("glyphicon-chevron-down");
    $this.toggleClass("glyphicon-chevron-up");
    if ($(".content").is(":visible")) {
      setPopupExpand(true);
    } else {
      setPopupExpand(false);
    }
  });
});

/* Manually feeds update */
$("#feedly").on("click", "#update-feeds", () => {
  if ($("#feed").is(":visible")) {
    renderFeeds(true);
  } else {
    renderSavedFeeds(true);
  }
});

/* Save or unsave feed */
$("#popup-content").on("click", ".save-feed", (event) => {
  const $this = $(event.target);
  const feed = $this.closest(".item");
  const feedId = feed.data("id");
  const saveItem = !$this.data("saved");
  popupGlobal.backgroundPage.toggleSavedFeed([feedId], saveItem);
  $this.data("saved", saveItem);
  $this.toggleClass("saved");
});

$("#popup-content").on("click", "#website", () => {
  popupGlobal.backgroundPage.openFeedlyTab();

  // Close the popup since the user wants to see Feedly website anyway
  window.close();
});

$("#popup-content").on("click", ".categories > span", (event) => {
  $(".categories").find("span").removeClass("active");
  const button = $(event.target).addClass("active");
  const categoryId = button.data("id");
  if (categoryId) {
    $(".item").hide();
    $(`.item[data-categories~='${categoryId}']`).show();
  } else {
    $(".item").show();
  }
});

$("#feedly").on("click", "#feedly-logo", (event) => {
  if (event.ctrlKey) {
    popupGlobal.backgroundPage.options.abilitySaveFeeds = !popupGlobal.backgroundPage.options.abilitySaveFeeds;
    window.location.reload();
  }
});
