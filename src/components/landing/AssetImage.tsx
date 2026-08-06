"use client";

import React, { useEffect, useRef, useState } from "react";

type AssetImageProps = {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function AssetImage({
  src,
  fallback,
  alt,
  className = "",
  loading = "lazy",
}: AssetImageProps) {
  const [current, setCurrent] = useState(src);
  const [ready, setReady] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrent(src);
    setReady(false);
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;

    if (img?.complete) {
      setReady(true);
    }
  }, [current]);

  return (
    <img
      ref={imgRef}
      src={current}
      alt={alt}
      loading={loading}
      draggable={false}
      onLoad={() => setReady(true)}
      onError={() => {
        if (fallback && current !== fallback) {
          setCurrent(fallback);
        }
      }}
      className={`transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}