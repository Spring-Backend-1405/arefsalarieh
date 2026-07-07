import type { Request } from "express";

export type SortFieldMap = Record<string, any>;

export const handleOrder = (
  sortByQuery: string = "createdAt",
  orderQuery: string = "asc",
  sortFieldMap: SortFieldMap,
) => {
  const validOrder = orderQuery?.toString().toLowerCase() === "desc" ? "desc" : "asc";

  if (!sortByQuery || !sortFieldMap[sortByQuery]) {
    return { orderBy: {}, sortKey: null, order: validOrder };
  }

  const fieldPath = sortFieldMap[sortByQuery];

  if (fieldPath === "IN_MEMORY") {
    return { orderBy: {}, sortKey: sortByQuery, order: validOrder };
  }

  const orderBy = buildNestedOrderBy(fieldPath, validOrder);
  return { orderBy, sortKey: null, order: validOrder };
};

function buildNestedOrderBy(path: string, order: string): any {
  const keys = path.split(".");
  const result: any = {};
  let cur = result;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cur[key] = order;
    } else {
      cur[key] = {};
      cur = cur[key];
    }
  });
  return result;
}

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
