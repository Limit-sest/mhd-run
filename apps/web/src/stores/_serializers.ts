function reviveDates(obj: unknown): unknown {
  if (
    typeof obj === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)
  ) {
    return new Date(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, reviveDates(value)])
    );
  }
  return obj;
}

export const dateSerializer = {
  serialize: (value: unknown) => JSON.stringify(value),
  deserialize: (value: string) => reviveDates(JSON.parse(value)),
};
