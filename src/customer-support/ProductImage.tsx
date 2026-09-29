import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { view } from "@/api/s3Client";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /** S3 object key, or legacy absolute URL. */
  imageKey: string;
};

/**
 * Renders a product image from an S3 key (via presigned view) or a legacy http(s) URL.
 */
export default function ProductImage({
  imageKey,
  alt = "",
  ...rest
}: Props) {
  const [src, setSrc] = useState(() =>
    imageKey && isAbsoluteUrl(imageKey) ? imageKey : "",
  );

  useEffect(() => {
    let cancelled = false;

    if (!imageKey) {
      setSrc("");
      return;
    }

    if (isAbsoluteUrl(imageKey)) {
      setSrc(imageKey);
      return;
    }

    setSrc("");
    view(imageKey)
      .then((data) => {
        if (!cancelled) setSrc(data.url);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });

    return () => {
      cancelled = true;
    };
  }, [imageKey]);

  if (!src) {
    return <div className={rest.className} aria-hidden />;
  }

  return <img src={src} alt={alt} {...rest} />;
}
