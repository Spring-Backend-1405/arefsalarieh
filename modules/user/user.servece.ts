import { prisma } from "../../utils/prisma";
import { UpdateProfileData, UpdateUserData } from "./userTypes";
import type { Request } from "express";

export const findUser = async (obj: any) => {
  const user = await prisma.user.findFirst({
    where: {
      ...obj,
    },
    include: {
      profile: true,
    },
  });

  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const checkEmail = async (email: string, userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: userId },
    },
  });

  return user;
};

export const createUpdateUserData = (req: Request) => {
  const { email, gender, phone, country, state, city, address, avatar, bio } =
    req.body;

  const userUpdateData: any = {};
  if (email !== undefined) userUpdateData.email = email;
  if (gender !== undefined) userUpdateData.gender = gender;

  const profileUpdateData: any = {};
  if (phone !== undefined) profileUpdateData.phone = phone;
  if (country !== undefined) profileUpdateData.country = country;
  if (state !== undefined) profileUpdateData.state = state;
  if (city !== undefined) profileUpdateData.city = city;
  if (address !== undefined) profileUpdateData.address = address;
  if (avatar !== undefined) profileUpdateData.avatar = avatar;
  if (bio !== undefined) profileUpdateData.bio = bio;

  return { userUpdateData, profileUpdateData };
};

export const handleUpdateUser = async (
  userId: string,
  userData: UpdateUserData,
  profileData: UpdateProfileData,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: userData,
  });

  const profile = await prisma.profile.upsert({
    where: { userId: userId },
    update: profileData,
    create: {
      userId: userId,
      ...profileData,
    },
  });

  const { password: _, ...userWithoutPassword } = user;


  return { ...userWithoutPassword, profile };
};
