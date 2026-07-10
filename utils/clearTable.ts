import { prisma } from "./prisma";

const clearTable = async () => {
  try {
    const result = await prisma.courseComment.delete({
      where : {id : '356d18a2-aa88-4fde-bea0-4b38dc4167af'}
    })
    console.log(result);
  } catch (error) {
    console.error( error);
  }
};

clearTable();