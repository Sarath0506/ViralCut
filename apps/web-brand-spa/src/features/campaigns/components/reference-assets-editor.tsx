import { useState } from "react";
import { Image, Link2, Loader2, Plus, Trash2, Upload, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createReferenceAsset,
  inferReferenceAssetType,
  type ReferenceAsset,
  type ReferenceAssetType,
} from "@/features/campaigns/lib/reference-assets";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const typeOptions: {
  value: ReferenceAssetType;
  label: string;
  icon: typeof Link2;
}[] = [
  { value: "link", label: "Link", icon: Link2 },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Video },
];

type ReferenceAssetsEditorProps = {
  assets: ReferenceAsset[];
  onChange: (assets: ReferenceAsset[]) => void;
  onUploadFile: (file: File, type: "image" | "video") => Promise<string>;
};

export function ReferenceAssetsEditor({
  assets,
  onChange,
  onUploadFile,
}: ReferenceAssetsEditorProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const updateAsset = (id: string, patch: Partial<ReferenceAsset>) => {
    onChange(
      assets.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)),
    );
  };

  const removeAsset = (id: string) => {
    onChange(assets.filter((asset) => asset.id !== id));
  };

  const addAsset = () => {
    onChange([...assets, createReferenceAsset()]);
  };

  const onSelectFile = async (
    asset: ReferenceAsset,
    file: File | undefined,
  ): Promise<void> => {
    if (!file || (asset.type !== "image" && asset.type !== "video")) {
      return;
    }
    setUploadingId(asset.id);
    try {
      const uploadedUrl = await onUploadFile(file, asset.type);
      updateAsset(asset.id, {
        url: uploadedUrl,
        label: asset.label.trim() ? asset.label : file.name,
      });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-variant/60 px-2 py-0.5 text-[11px] text-muted"
          >
            <option.icon className="h-3 w-3" />
            {option.label}
          </span>
        ))}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-variant/30 px-4 py-6 text-center text-sm text-muted">
          No reference assets yet. Add YouTube, Drive, image, or video links.
        </div>
      ) : (
        <ul className="space-y-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted">Type</Label>
                  <select
                    className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm"
                    value={asset.type}
                    onChange={(e) =>
                      updateAsset(asset.id, {
                        type: e.target.value as ReferenceAssetType,
                      })
                    }
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  {asset.type === "link" ? (
                    <>
                      <Label className="text-xs font-semibold text-muted">URL</Label>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={asset.url}
                        onChange={(e) => updateAsset(asset.id, { url: e.target.value })}
                        onBlur={() => {
                          if (!asset.url.trim()) return;
                          updateAsset(asset.id, {
                            type: inferReferenceAssetType(asset.url),
                          });
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Label className="text-xs font-semibold text-muted">File</Label>
                      <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-variant/40 px-3 text-sm text-foreground hover:bg-surface-variant">
                        {uploadingId === asset.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {asset.url ? "Replace file" : "Choose file"}
                          </>
                        )}
                        <input
                          type="file"
                          accept={asset.type === "image" ? "image/*" : "video/*"}
                          className="hidden"
                          disabled={uploadingId === asset.id}
                          onChange={(e) =>
                            void onSelectFile(asset, e.target.files?.[0])
                          }
                        />
                      </label>
                      {asset.url && asset.type === "image" ? (
                        <img
                          src={resolveMediaUrl(asset.url)}
                          alt={asset.label || "Reference preview"}
                          className="mt-2 h-20 w-full rounded-lg border border-border object-cover"
                        />
                      ) : null}
                      {asset.url ? (
                        <p className="truncate text-xs text-muted">{asset.url}</p>
                      ) : (
                        <p className="text-xs text-muted">
                          Upload a {asset.type} file to attach it.
                        </p>
                      )}
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("sm:mt-5", "text-muted hover:text-destructive")}
                  onClick={() => removeAsset(asset.id)}
                  aria-label="Remove asset"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                <Label className="text-xs font-semibold text-muted">
                  Label (optional)
                </Label>
                <Input
                  value={asset.label}
                  onChange={(e) => updateAsset(asset.id, { label: e.target.value })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addAsset}>
        <Plus className="h-4 w-4" />
        Add asset
      </Button>
    </div>
  );
}
