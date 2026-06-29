export interface UpdateUserData {
  email?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface UpdateProfileData {
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  avatar?: string;
  bio?: string;
}

export interface FilesUploaded {
  filename : string;
  path : string;
  mimetype : string;
  size : number
}