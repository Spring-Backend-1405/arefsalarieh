import { prisma } from "./prisma";

const clearTable = async () => {
  try {
    const result = await prisma.userPermission.deleteMany({
      where : {userId : '2f08b9cf-cdf5-4056-a897-9828fdb74307'}
    })
    console.log(result);
  } catch (error) {
    console.error( error);
  }
};

clearTable();