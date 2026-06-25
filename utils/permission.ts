import { prisma } from "../utils/prisma";

export const hasPermission = async (
  userId: string,
  resource: string,
  action: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
  

  if (!user) return false;

  for (const userRole of user.roles) {
    const role = userRole.role;
    if (!role) continue;

    const hasAccess = role.rolePermissions.some(
      (rp) =>
        rp.permission.resource === resource && rp.permission.action === action,
    );
    if (hasAccess) return true;
  }

  return false;
};
