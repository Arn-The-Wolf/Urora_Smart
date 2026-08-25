/** Parse multi-photo JSON, falling back to a legacy single photoUrl. */
export function parsePhotoList(photoUrls: string | null | undefined, photoUrl?: string | null): string[] {
  if (photoUrls) {
    try {
      const parsed = JSON.parse(photoUrls) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.length > 0).slice(0, 6);
      }
    } catch {
      /* ignore */
    }
  }
  return photoUrl ? [photoUrl] : [];
}

export function serializePhotoList(photos: string[] | null | undefined) {
  const list = (photos ?? []).filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 6);
  return {
    photoUrls: list.length ? JSON.stringify(list) : null,
    photoUrl: list[0] ?? null,
  };
}
