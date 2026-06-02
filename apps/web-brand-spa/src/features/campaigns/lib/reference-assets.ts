export type ReferenceAssetType = "image" | "video" | "link";

export type ReferenceAsset = {
  id: string;
  type: ReferenceAssetType;
  url: string;
  label: string;
};

export function inferReferenceAssetType(url: string): ReferenceAssetType {
  const lower = url.trim().toLowerCase();
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".webm")
  ) {
    return "video";
  }
  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif")
  ) {
    return "image";
  }
  return "link";
}

export function createReferenceAsset(
  partial?: Partial<Pick<ReferenceAsset, "type" | "url" | "label">>,
): ReferenceAsset {
  return {
    id: crypto.randomUUID(),
    type: partial?.type ?? "link",
    url: partial?.url ?? "",
    label: partial?.label ?? "",
  };
}

export function parseReferenceAssetsFromText(text: string): ReferenceAsset[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) =>
      createReferenceAsset({
        url,
        type: inferReferenceAssetType(url),
      }),
    );
}

export function toApiReferenceAssets(assets: ReferenceAsset[]) {
  return assets
    .map((asset) => ({
      type: asset.type,
      url: asset.url.trim(),
      label: asset.label.trim() || undefined,
    }))
    .filter((asset) => asset.url.length > 0);
}
