/** Project resources — files stored on Cloudinary, listed against a project. */

/** Cloudinary's own classification, decided server-side from the upload's mime type. */
export const RESOURCE_TYPES = ["image", "video", "raw"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export type Resource = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  type: ResourceType;
  file_url: string;
  public_id: string;
  version: string;
  created_at: string;
  updated_at: string;
};

export type ResourceUpload = {
  file: File;
  projectID: string;
  title: string;
  description: string;
  version: string;
};
