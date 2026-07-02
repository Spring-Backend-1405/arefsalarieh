import { prisma } from "./prisma";

async function seedCourseCategories() {
  console.log("🌱 Seeding CourseCategories...");

  // لیست دسته‌بندی‌های اصلی (سطح بالا)
  const parentCategories = [
    { categoryName: "Programming" },
    { categoryName: "Design" },
    { categoryName: "Business" },
    { categoryName: "Marketing" },
    { categoryName: "Photography" },
    { categoryName: "Music" },
  ];

  // لیست زیردسته‌ها (با نام والد)
  const childCategories = [
    { categoryName: "JavaScript", parentName: "Programming" },
    { categoryName: "Python", parentName: "Programming" },
    { categoryName: "UI/UX", parentName: "Design" },
    { categoryName: "Graphic Design", parentName: "Design" },
    { categoryName: "Entrepreneurship", parentName: "Business" },
    { categoryName: "Digital Marketing", parentName: "Marketing" },
    { categoryName: "SEO", parentName: "Marketing" },
    { categoryName: "Portrait Photography", parentName: "Photography" },
    { categoryName: "Guitar", parentName: "Music" },
    { categoryName: "Piano", parentName: "Music" },
    { categoryName: "React", parentName: "Programming" },
    { categoryName: "Node.js", parentName: "Programming" },
    { categoryName: "Adobe Photoshop", parentName: "Design" },
    { categoryName: "Data Analysis", parentName: "Business" },
  ];

  try {
    await prisma.$transaction(async (tx) => {
      // 1. درج دسته‌بندی‌های اصلی و ذخیره نگاشت نام → id
      const parentMap: Record<string, number> = {};

      for (const cat of parentCategories) {
        const created = await tx.courseCategory.create({
          data: {
            categoryName: cat.categoryName,
            parentId: null,
          },
        });
        parentMap[cat.categoryName] = created.id;
        console.log(`✅ Created parent: ${cat.categoryName} (id: ${created.id})`);
      }

      // 2. درج زیردسته‌ها با استفاده از parentMap
      for (const child of childCategories) {
        const parentId = parentMap[child.parentName];
        if (!parentId) {
          console.warn(`⚠️ Parent "${child.parentName}" not found. Skipping child: ${child.categoryName}`);
          continue;
        }

        await tx.courseCategory.create({
          data: {
            categoryName: child.categoryName,
            parentId: parentId,
          },
        });
        console.log(`✅ Created child: ${child.categoryName} (parent: ${child.parentName})`);
      }
    });

    console.log("🎉 Seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
}

// اجرای مستقیم اسکریپت
seedCourseCategories()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });