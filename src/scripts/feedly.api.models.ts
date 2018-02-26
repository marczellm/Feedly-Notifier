export interface IFeedlyAuthToken {
  id: string;
  refresh_token?: string;
  access_token?: string;
  expires_in: number;
  token_type: string;
  plan?: string;
  state?: string;
}

// TODO: remove [key: string]: string | undefined member
export interface IFeedlyUserInfo {
  [key: string]: string | undefined;
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

export interface IFeedlyEntryContent {
  direction: string;
  content: string;
}

export interface IFeedlyCategory {
  id: string;
  label: string;
}

export interface IFeedlyEntryOrigin {
  streamId: string;
  title: string;
  htmlUrl: string;
}

export interface IFeedlyImage {
  url: string;
}

export interface IFeedlyTag {
  id: string;
  label?: string;
}

export interface IFeedlyLinkObject {
  href: string;
  type?: string;
}

export interface IFeedlyEntry {
  id: string;
  title?: string;
  content?: IFeedlyEntryContent;
  summary?: IFeedlyEntryContent;
  keywords?: string[];
  originId: string;
  fingerprint: string;
  crawled: number;
  unread: false;
  author?: string;
  categories: IFeedlyCategory[];
  origin?: IFeedlyEntryOrigin;
  engagement?: number;
  thumbnail: IFeedlyImage[];
  tags?: IFeedlyTag[];
  alternate?: IFeedlyLinkObject[];
}

export interface IFeedlyStream {
  id: string;
  title: string;
  direction: string;
  continuation: string;
  items: IFeedlyEntry[];
}

export interface IFeedlySubscription {
  id: string;
  title: string;
  categories: IFeedlyCategory[];

}

export interface IFeedlyUnreadCount {
  id: string;
  count: number;
}

export interface IFeedlyMarkerCounts {
  unreadcounts: IFeedlyUnreadCount[];
  updated: any;
}
