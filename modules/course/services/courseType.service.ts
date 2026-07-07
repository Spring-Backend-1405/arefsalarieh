import { prisma } from "../../../utils/prisma";

export const findCourses = async (
  where: any,
  orderBy: any,
  skip: any,
  limit: any,
): Promise<any> => {
  return await prisma.course.findMany({
    where,
    orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
    select: {
      id: true,
      title: true,
      shortDescription: true,
      level: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      isFree: true,
      teacher: {
        select: { id: true, name: true, email: true },
      },
      courseType: {
        select: { id: true, typeName: true },
      },
      coursePrices: {
        where: { isActive: true },
        take: 1,
        select: { price: true, discountPrice: true },
      },
      courseCategoryLists: {
        select: {
          category: {
            select: { id: true, categoryName: true, parentId: true },
          },
        },
      },
      detail: {
        select: { totalStudent: true, duration: true },
      },
    },
    skip,
    take: limit,
  });
};


export const selectedFields =  (courses : any)   =>{
     return courses.map((course: any) => ({
      id: course.id,
      title: course.title,
      shortDescription: course.shortDescription,
      level: course.level,
      status: course.status,
      createdAt: course.createdAt,
      isFree: course.isFree,
      teacher: course.teacher
        ? {
            id: course.teacher.id,
            name: course.teacher.name,
            avatar: course.teacher.profile?.avatar || null,
          }
        : null,
      type: course.courseType?.typeName || null,
      price: course.coursePrices[0]?.price || 0,
      discountPrice: course.coursePrices[0]?.discountPrice || null,
      categories: course.courseCategoryLists.map((item: any) => item.category),
      totalStudent: course.detail?.totalStudent || 0,
      duration: course.detail?.duration || null,
    }));
}