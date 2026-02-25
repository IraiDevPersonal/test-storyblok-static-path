
export type PhotoModel = {
  albumId: number;
  id: number;
  title: string;
  thumbnailUrl: string;
  url: string;
};

export const data: PhotoModel[] = [
  {
    albumId: 1,
    id: 1,
    title: "Mountain Landscape",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
  },
  {
    albumId: 1,
    id: 2,
    title: "Ocean Sunset",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop",
  },
  {
    albumId: 1,
    id: 3,
    title: "Forest Path",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop",
  },
];