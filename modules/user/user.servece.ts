import { toBoolean } from "../../utils/boolean.helper";
// import { capitalizeFirstLetter } from "../../utils/capitalize";
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
  const {
    email,
    name,
    gender,
    phone,
    country,
    state,
    city,
    address,
    avatar,
    bio,
  } = req.body;

  const userUpdateData: any = {};
  if (email !== undefined) userUpdateData.email = email;
  if (name !== undefined) userUpdateData.name = name;
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

export const handleQuery = (req: Request) => {
  const { name, email, gender, isActive, isDelete, country, state, city } =
    req.query;

  const nameFilter = typeof name === "string" ? name : undefined;
  const emailFilter = typeof email === "string" ? email : undefined;
  const genderFilter = typeof gender === "string" ? gender : undefined;
  const isActiveFilter = toBoolean(isActive as string | undefined);
  const isDeleteFilter = toBoolean(isDelete as string | undefined);

  const countryFilter = typeof country === "string" ? country : undefined;
  const stateFilter = typeof state === "string" ? state : undefined;
  const cityFilter = typeof city === "string" ? city : undefined;

  const where: any = {};

  if (nameFilter) {
    where.name = {
      contains: nameFilter,
    };
  }
  if (emailFilter) {
    where.email = {
      contains: emailFilter,
    };
  }

  if (genderFilter) {
    where.gender = genderFilter;
  }

  if (isActiveFilter !== undefined) {
    where.isActive = isActiveFilter;
  }
  if (isDeleteFilter !== undefined) {
    where.isDelete = isDeleteFilter;
  }

  const profileFilter: any = {};
  if (countryFilter) {
    profileFilter.country = {
      contains: countryFilter,
    };
  }
  if (stateFilter) {
    profileFilter.state = {
      contains: stateFilter,
    };
  }
  if (cityFilter) {
    profileFilter.city = {
      contains: cityFilter,
    };
  }

  if (Object.keys(profileFilter).length > 0) {
    where.profile = profileFilter;
  }

  return where;
};

export const handleOrder = (req: Request) => {
  const { sortBy, order } = req.query;

  let orderBy = {
    createdAt: "asc" as const,
  };

  if (typeof sortBy === "string" && typeof order === "string") {
    const validOrder = order.toLowerCase() === "desc" ? "desc" : "asc";

    const allowedFields = ["name", "email", "gender", "createdAt", "isActive"];

    if (allowedFields.includes(sortBy)) {
      orderBy = {
        [sortBy]: validOrder,
      } as typeof orderBy;
    }
  }

  return orderBy;
};


export const handlePagination = (req: Request) => {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

  return {skip , limit};
};