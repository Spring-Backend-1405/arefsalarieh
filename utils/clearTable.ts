import { prisma } from "./prisma";

const clearTable = async () => {
  try {
    const result = await prisma.courseComment.delete({
      where : {id : 'e932fc18-4beb-4f93-ac05-b0e492c65261'}
    })
    console.log(result);
  } catch (error) {
    console.error( error);
  }
};

clearTable();