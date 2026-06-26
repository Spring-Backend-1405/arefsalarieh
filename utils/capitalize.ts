export const capitalizeFirstLetter = (str: string | undefined | null): string | undefined | null => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};


export const capitalizeFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T => {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string') {
      result[field] = capitalizeFirstLetter(value) as any;
    }
  }
  return result;
};