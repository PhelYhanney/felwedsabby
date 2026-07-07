import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { QRSettings } from "./types";

// Client-only QR renderer. qr-code-styling touches `document`, so we lazy-load
// it inside an effect and reuse the same instance across prop changes.
export function QRPreview({
  data,
  settings,
  size = 320,
  onReady,
}: {
  data: string;
  settings: QRSettings;
  size?: number;
  onReady?: (qr: any) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const options = useMemo(() => buildOptions(data, settings, size), [data, settings, size]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("qr-code-styling");
      if (cancelled || !ref.current) return;
      const QRCodeStyling = mod.default;
      if (!qrRef.current) {
        qrRef.current = new QRCodeStyling(options);
        ref.current.innerHTML = "";
        qrRef.current.append(ref.current);
      } else {
        qrRef.current.update(options);
      }
      setReady(true);
      onReady?.(qrRef.current);
    })();
    return () => {
      cancelled = true;
    };
  }, [options, onReady]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center rounded-3xl bg-white p-6"
      style={{ width: size + 48, height: size + 48, boxShadow: "var(--shadow-elegant)" }}
    >
      <div ref={ref} />
      {!ready && (
        <div className="absolute inset-0 animate-pulse rounded-3xl bg-muted/50" />
      )}
    </motion.div>
  );
}

export function buildOptions(data: string, s: QRSettings, size: number) {
  const gradient = s.fgGradient
    ? {
        type: s.gradientType,
        rotation: s.gradientType === "linear" ? Math.PI / 4 : 0,
        colorStops: [
          { offset: 0, color: s.fgColor },
          { offset: 1, color: s.fgColor2 },
        ],
      }
    : undefined;
  return {
    width: size,
    height: size,
    type: "canvas" as const,
    data,
    margin: s.margin,
    qrOptions: { errorCorrectionLevel: s.ecl },
    image: s.logo || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: s.logoSize,
      margin: s.logoBg ? 6 : 0,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      type: s.dotStyle,
      color: s.fgColor,
      ...(gradient ? { gradient } : {}),
    },
    backgroundOptions: { color: s.bgColor },
    cornersSquareOptions: {
      type: s.eyeStyle,
      color: s.eyeColor || s.fgColor,
    },
    cornersDotOptions: {
      type: s.eyeDotStyle,
      color: s.eyeColor || s.fgColor,
    },
  } as any;
}