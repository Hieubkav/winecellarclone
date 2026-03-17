import Image from "next/image";
import { DYNAMIC_ICON_MAP, resolveLucideIconName } from "@/lib/icons/dynamicIconRegistry";

type DynamicIconProps = {
  iconUrl?: string | null;
  iconName?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  imageClassName?: string;
};

export default function DynamicIcon({
  iconUrl,
  iconName,
  alt = "",
  size = 16,
  className,
  imageClassName,
}: DynamicIconProps) {
  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={imageClassName ?? className}
      />
    );
  }

  const resolvedIconName = resolveLucideIconName(iconName);

  if (resolvedIconName) {
    const IconComponent = DYNAMIC_ICON_MAP[resolvedIconName];
    return <IconComponent className={className} size={size} />;
  }

  return <span className={className} aria-hidden />;
}
