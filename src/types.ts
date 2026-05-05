export interface Station {
  id: string;
  name: string;
  genre: string;
  logo_url: string;
  status: string;
  stream_link: string;
  youtube_link?: string;
  country?: string;
  slug?: string;
  description_ar?: string;
  description_fr?: string;
  description_en?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  link: string;
  pubDate: number;
  thumbnail: string | null;
  sourceName: string;
  sourceLogo: string;
  genre: string;
  language?: string;
  imageUrl?: string;
  metaDescription?: string;
  category?: string;
  coverImage?: string;
}
