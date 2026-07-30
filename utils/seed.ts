import { prisma } from "./prisma";

async function seedCourses() {
  console.log("🌱 Seeding 10 additional courses...");



  try {
    await prisma.userPictures.deleteMany()

    console.log("🎉 Seeding completed! 10 additional courses added.");
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    throw error;
  }
}

seedCourses()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });