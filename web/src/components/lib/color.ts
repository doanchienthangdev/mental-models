export function colorForSlug(slug: string, palette: string[]) {
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}
