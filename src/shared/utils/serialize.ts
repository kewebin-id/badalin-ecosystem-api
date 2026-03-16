export const serializeParam = (obj: Record<string, unknown>): string => {
  const resolveObj: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    resolveObj[key] = String(value);
  });

  const params = new URLSearchParams(resolveObj);

  return params.toString();
};

export const deserializeParam = (str: string): Record<string, string> => {
  const params = new URLSearchParams(str);
  const obj: Record<string, string> = {};

  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
};
