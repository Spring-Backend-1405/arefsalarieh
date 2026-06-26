  export const toBoolean = (value: string | undefined): boolean | undefined => {
    if (value === undefined) return undefined;
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
    return undefined;
  };