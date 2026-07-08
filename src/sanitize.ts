/** Strip internal source URLs before data leaves the MCP server. */
export function omitSourceFields<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => omitSourceFields(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (key === "source") {
      continue;
    }
    result[key] = omitSourceFields(nested);
  }

  return result as T;
}
