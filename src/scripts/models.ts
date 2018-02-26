export enum Browser {
  Chrome = "chrome",
  Firefox = "firefox",
  Opera = "opera",
}

export interface IFeedlyNotifierUserCategoryFilter {
  id: string;
  label: string;
  checked: boolean;
}

export interface IFeedlyNotifierCategory {
  id: string;
  encodedId: string;
  label: string;
}

export interface IFeedlyNotifierFeedEntry {
  id: string;
  title: string;
  titleDirection?: string;
  content: string;
  contentDirection?: string;
  date: Date;
  isoDate: string;
  url: string;
  author?: string;
  blog?: string;
  blogUrl?: string;
  blogIcon?: string;
  blogTitleDirection?: string;
  thumbnail?: string;
  categories: IFeedlyNotifierCategory[];
  isSaved: boolean;
  showEngagement: boolean;
  engagement?: number;
  engagementPostfix: string;
  isEngagementHot: boolean;
  isEngagementOnFire: boolean;
}
