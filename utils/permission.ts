import { prisma } from "../utils/prisma";

export const hasPermission = async (
  userId: string,
  resource: string,
  action: string,
): Promise<boolean> => {
  const permission = await prisma.permission.findUnique({
    where: {
      resource_action: { resource, action },
    },
  });
  if (!permission) return false; 

  const userPermission = await prisma.userPermission.findUnique({
    where: {
      userId_permissionId: {
        userId,
        permissionId: permission.id,
      },
    },
  });

  if (userPermission) {
    return userPermission.type === "ALLOW";
  }

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