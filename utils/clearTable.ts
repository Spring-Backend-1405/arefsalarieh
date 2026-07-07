import { prisma } from "./prisma";

const clearTable = async () => {
  try {
    const result = await prisma.course.deleteMany({});
    console.log(result);
  } catch (error) {
    console.error( error);
  }
};

clearTable();