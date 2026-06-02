import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";

export function ensureUploadDir(...segments: string[]): string {
  const dir = join(process.cwd(), "uploads", ...segments);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

export function uploadFilename(originalname: string, mimetype: string): string {
  const ext = extname(originalname) || MIME_EXT[mimetype] || "";
  return `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
}

export function finalizeUploadedFile(
  folder: string,
  file: { filename: string; originalname: string; mimetype?: string },
): { filename: string; originalname: string } {
  const ext =
    extname(file.originalname) ||
    (file.mimetype ? MIME_EXT[file.mimetype] : "") ||
    "";
  if (!ext || file.filename.endsWith(ext)) {
    return file;
  }

  const dir = ensureUploadDir(folder);
  const nextName = `${file.filename}${ext}`;
  renameSync(join(dir, file.filename), join(dir, nextName));
  return { filename: nextName, originalname: file.originalname };
}

export function buildUploadedFileResponse(
  req: Request,
  folder: string,
  file: { filename: string; originalname: string },
) {
  const relativeUrl = `/uploads/${folder}/${file.filename}`;
  const host = req.get("host");
  const protocol = req.protocol;
  const absoluteUrl = host ? `${protocol}://${host}${relativeUrl}` : relativeUrl;
  return {
    url: absoluteUrl,
    path: relativeUrl,
    name: file.originalname,
  };
}

export function imageOnlyFileFilter(
  _req: unknown,
  file: { mimetype: string },
  cb: (error: Error | null, accept: boolean) => void,
): void {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new BadRequestException("Only image files are allowed") as unknown as Error, false);
}

export function imageOrVideoFileFilter(
  _req: unknown,
  file: { mimetype: string },
  cb: (error: Error | null, accept: boolean) => void,
): void {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
    return;
  }
  cb(
    new BadRequestException("Only image and video files are allowed") as unknown as Error,
    false,
  );
}
