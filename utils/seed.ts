import "dotenv/config";
import { prisma } from "./prisma";
import { Resources, Actions, Roles } from "../constants/permissions";

const rolePermissionsMap: Record<string, { resource: string; action: string }[]> = {
  [Roles.SUPER_ADMIN]: [
    { resource: Resources.COURSE, action: Actions.CREATE },
    { resource: Resources.COURSE, action: Actions.READ },
    { resource: Resources.COURSE, action: Actions.UPDATE },
    { resource: Resources.COURSE, action: Actions.DELETE },
    { resource: Resources.COURSE, action: Actions.ENROLL },
    { resource: Resources.COURSE, action: Actions.LIKE },
    { resource: Resources.COURSE, action: Actions.FAVORITE },
    { resource: Resources.USER, action: Actions.CREATE },
    { resource: Resources.USER, action: Actions.READ },
    { resource: Resources.USER, action: Actions.UPDATE },
    { resource: Resources.USER, action: Actions.DELETE },
    { resource: Resources.COMMENT, action: Actions.CREATE },
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.UPDATE },
    { resource: Resources.COMMENT, action: Actions.DELETE },
    { resource: Resources.ORDER, action: Actions.CREATE },
    { resource: Resources.ORDER, action: Actions.READ },
    { resource: Resources.ORDER, action: Actions.UPDATE },
    { resource: Resources.ORDER, action: Actions.DELETE },
    { resource: Resources.PROFILE, action: Actions.CREATE },
    { resource: Resources.PROFILE, action: Actions.READ },
    { resource: Resources.PROFILE, action: Actions.UPDATE },
    { resource: Resources.PROFILE, action: Actions.DELETE },
  ],
  [Roles.ADMIN]: [
    { resource: Resources.COURSE, action: Actions.CREATE },
    { resource: Resources.COURSE, action: Actions.READ },
    { resource: Resources.COURSE, action: Actions.UPDATE },
    { resource: Resources.COURSE, action: Actions.DELETE },
    { resource: Resources.USER, action: Actions.READ },
    { resource: Resources.USER, action: Actions.UPDATE },
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.UPDATE },
    { resource: Resources.COMMENT, action: Actions.DELETE },
    { resource: Resources.ORDER, action: Actions.READ },
    { resource: Resources.ORDER, action: Actions.UPDATE },
    { resource: Resources.PROFILE, action: Actions.READ },
  ],
  [Roles.TEACHER]: [
    { resource: Resources.COURSE, action: Actions.CREATE },
    { resource: Resources.COURSE, action: Actions.READ },
    { resource: Resources.COURSE, action: Actions.UPDATE },
    { resource: Resources.COURSE, action: Actions.DELETE },
    { resource: Resources.COURSE, action: Actions.ENROLL },
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.UPDATE },
    { resource: Resources.COMMENT, action: Actions.DELETE }, 
  ],
  [Roles.STUDENT]: [
    { resource: Resources.COURSE, action: Actions.READ },
    { resource: Resources.COURSE, action: Actions.ENROLL },
    { resource: Resources.COURSE, action: Actions.LIKE },
    { resource: Resources.COURSE, action: Actions.FAVORITE },
    { resource: Resources.COMMENT, action: Actions.CREATE },
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.UPDATE },
    { resource: Resources.COMMENT, action: Actions.DELETE },
    { resource: Resources.PROFILE, action: Actions.READ },
    { resource: Resources.PROFILE, action: Actions.UPDATE },
  ],
  [Roles.USER]: [
    { resource: Resources.COURSE, action: Actions.READ },
    { resource: Resources.COURSE, action: Actions.LIKE },
    { resource: Resources.COURSE, action: Actions.FAVORITE },
    { resource: Resources.COMMENT, action: Actions.CREATE },
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.PROFILE, action: Actions.READ },
    { resource: Resources.PROFILE, action: Actions.UPDATE },
  ],
  [Roles.REFEREE]: [
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.UPDATE },
    { resource: Resources.COMMENT, action: Actions.DELETE },
    { resource: Resources.USER, action: Actions.READ },
  ],
  [Roles.MENTOR]: [
    { resource: Resources.USER, action: Actions.READ },
    { resource: Resources.COURSE, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.READ },
    { resource: Resources.COMMENT, action: Actions.UPDATE },
  ],
};

async function main() {
  console.log("🌱 Seeding started...");

  const permissionMap = new Map<string, string>(); 

  for (const resource of Object.values(Resources)) {
    for (const action of Object.values(Actions)) {
      const key = `${resource}:${action}`;
      const permission = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {}, 
        create: {
          resource,
          action,
          description: `${resource} ${action} permission`,
        },
      });
      permissionMap.set(key, permission.id);
    }
  }

  console.log(`✅ ${permissionMap.size} permissions upserted.`);

  const roleIds: Record<string, string> = {};
  for (const roleName of Object.values(Roles)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {}, 
      create: {
        name: roleName,
        description: `${roleName} role`,
        isActive: true,
      },
    });
    roleIds[roleName] = role.id;
  }

  console.log(`✅ ${Object.keys(roleIds).length} roles upserted.`);

  for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
    const roleId = roleIds[roleName];
    if (!roleId) {
      console.warn(`⚠️ Role "${roleName}" not found, skipping.`);
      continue;
    }

    for (const { resource, action } of permissions) {
      const key = `${resource}:${action}`;
      const permissionId = permissionMap.get(key);
      if (!permissionId) {
        console.warn(`⚠️ Permission "${key}" not found, skipping.`);
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {}, 
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log("✅ RolePermissions seeded successfully.");
  console.log("🌱 Seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });