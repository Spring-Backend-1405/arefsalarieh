import type { Request } from "express";

export const handleOrder = (
  sortBy: string = "createdAt",
  order: string = "asc",
  allowedFields: string[],
) => {
  let orderBy: any = {};

  if (typeof sortBy === "string" && typeof order === "string") {
    const validOrder = order.toLowerCase() === "desc" ? "desc" : "asc";

    if (allowedFields.includes(sortBy)) {
      orderBy = {
        [sortBy]: validOrder,
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
