export const getBase64ImageSize = (image: string): number => {
  const total = Math.ceil(image.length / 4) * 3;
  if (image.endsWith("==")) {
    return total - 2;
  } else if (image.endsWith("=")) {
    return total - 1;
  }

  return total;
};

export const readableFileSize = (
  byteCount: number,
  si = true,
  dp = 1
): string => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(byteCount) < thresh) {
    return byteCount + " B";
  }

  const units = si
    ? ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    byteCount /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(byteCount) * r) / r >= thresh &&
    u < units.length - 1
  );

  return byteCount.toFixed(dp) + " " + units[u];
};
