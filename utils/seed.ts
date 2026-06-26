import "dotenv/config";
import { prisma } from "./prisma";
import { capitalizeFirstLetter } from "./capitalize"; // فرض می‌کنیم این فایل در مسیر utils/capitalize.ts وجود دارد

// لیست آیدی کاربران (به‌جز کاربر مستثنی)
const userIds = [
  "6d023c32-c1a3-45ce-8964-abd2e10f3f94",
  "36dd3acf-40a3-430d-94a8-490a42855ebe",
  "0d614bf9-916c-4575-9d0d-fc4c8d61ad00",
  "2f08b9cf-cdf5-4056-a897-9828fdb74307",
  "3d2763b9-d24a-4e11-ba3c-7f2ba419852b",
  "6d06ac25-cc5d-4a75-be3f-26289cc136b5",
  "50b43ad4-499e-4bb8-871f-41ac13429897",
  "bf324394-08cd-413a-a84c-49bc1130fea4",
  "41aca14d-196f-4302-9f82-1323d043ed33",
  "f03437ab-202b-4f77-8001-6d9a76189b52",
  "29b92f4f-164b-4f0c-89ae-4e0e6fab453f",
  "301414e1-cc28-4eff-a6ed-7c0bdf74a0f4",
];

const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

// داده‌های نام و جنسیت (انگلیسی)
const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Emily",
  "David",
  "Sarah",
  "Robert",
  "Jessica",
  "William",
  "Karen",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Martinez",
  "Wilson",
];
const genders = ["MALE", "FEMALE", "OTHER"] as const;

// داده‌های پروفایل (با تکرار برای فیلتر)
const countries = [
  "USA",
  "USA",
  "USA",
  "Canada",
  "UK",
  "Germany",
  "France",
  "Australia",
  "India",
  "Brazil",
];
const statesMap: Record<string, string[]> = {
  USA: ["California", "Texas", "New York", "Florida", "Illinois"],
  Canada: ["Ontario", "Quebec", "British Columbia"],
  UK: ["England", "Scotland", "Wales"],
  Germany: ["Bavaria", "Berlin", "Hesse"],
  France: ["Île-de-France", "Provence", "Normandy"],
  Australia: ["New South Wales", "Victoria", "Queensland"],
  India: ["Maharashtra", "Karnataka", "Tamil Nadu"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Bahia"],
};
const cities = [
  "Springfield",
  "Lakewood",
  "Riverside",
  "Fairview",
  "Oakland",
  "Greenville",
  "Bristol",
  "Clinton",
  "Salem",
  "Brighton",
];
const streets = [
  "Main St",
  "Oak Ave",
  "Maple Dr",
  "Cedar Ln",
  "Pine Rd",
  "Elm Blvd",
  "Washington St",
  "Lincoln Ave",
];

async function updateUsersAndProfiles() {
  console.log("Starting update of users and profiles...");

  for (const userId of userIds) {
    // 1. تولید نام و جنسیت
    const firstName = pickRandom(firstNames);
    const lastName = pickRandom(lastNames);
    const fullName = capitalizeFirstLetter(`${firstName} ${lastName}`); // بزرگ کردن حرف اول کل نام
    const gender = Math.random() < 0.4 ? "MALE" : "FEMALE";

    // 2. تولید داده‌های پروفایل با بزرگ کردن حرف اول
    const country = capitalizeFirstLetter(pickRandom(countries));
    const state = capitalizeFirstLetter(pickRandom(statesMap[country] || ["Unknown"]));
    const city = capitalizeFirstLetter(pickRandom(cities));
    const street = pickRandom(streets);
    const address = `${Math.floor(Math.random() * 999) + 1} ${street}`;
    const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    const bio = `I am a ${pickRandom(["developer", "designer", "teacher", "student", "entrepreneur", "artist"])} from ${city}.`;

    try {
      await prisma.$transaction(async (tx) => {
        // به‌روزرسانی User
        await tx.user.update({
          where: { id: userId },
          data: {
            name: fullName,
            gender: gender,
          },
        });

        // به‌روزرسانی یا ایجاد Profile
        const existingProfile = await tx.profile.findUnique({
          where: { userId },
        });

        if (existingProfile) {
          await tx.profile.update({
            where: { userId },
            data: {
              country,
              state,
              city,
              address,
              phone,
              bio,
            },
          });
        } else {
          await tx.profile.create({
            data: {
              userId,
              country,
              state,
              city,
              address,
              phone,
              bio,
            },
          });
        }
      });

      console.log(
        `✅ Updated user ${userId} (${fullName}) with country: ${country}, state: ${state}`,
      );
    } catch (error) {
      console.error(`❌ Failed to update user ${userId}:`, error);
    }
  }

  console.log("✅ Update completed.");
}

updateUsersAndProfiles()
  .catch((e) => {
    console.error("❌ Error in seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });