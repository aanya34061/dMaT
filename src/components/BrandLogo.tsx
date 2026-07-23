'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'horizontal' | 'stacked' | 'emblem';
  height?: number;
  className?: string;
  linkToHome?: boolean;
}

export default function BrandLogo({
  variant = 'horizontal',
  height = 44,
  className = '',
  linkToHome = false,
}: BrandLogoProps) {
  let src = '/dmat_logo_horizontal.png';
  let alt = 'dMAT Official Logo';
  let aspectRatio = 439 / 124; // 3.540

  if (variant === 'stacked') {
    src = '/dmat_logo_transparent.png';
    aspectRatio = 317 / 360; // 0.880
  } else if (variant === 'emblem') {
    src = '/dmat_emblem_transparent.png';
    aspectRatio = 240 / 221; // 1.086
  }

  const calculatedWidth = Math.round(height * aspectRatio);

  const logoContent = (
    <div className={`inline-flex items-center justify-center select-none transition-opacity hover:opacity-95 ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={calculatedWidth}
        height={height}
        className="object-contain w-auto filter drop-shadow-sm"
        style={{ height: `${height}px` }}
        priority
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center focus:outline-none rounded-lg">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
