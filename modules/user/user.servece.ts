import { prisma } from "../../utils/prisma";

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
