import type { Request } from "express";

export const handleOrder = (
  sortByQuery: string = "createdAt",
  orderQuery: string = "asc",
  allowedFields: string[],
) => {
  let orderBy: any = {};

  if (typeof sortByQuery === "string" && typeof orderQuery === "string") {
    const validOrder = orderQuery.toLowerCase() === "desc" ? "desc" : "asc";

    if (allowedFields.includes(sortByQuery)) {
      orderBy = {
        [sortByQuery]: validOrder,
      } as typeof orderBy;
    }
  }

  return orderBy;
};

export const handleSearch = (field: string, value: string) => {
  if (!value) return {};

  return {
    [field]: {
      contains: value,
    },
  };
};


export const handlePagination = (req: Request) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  return { skip, limit };
};
