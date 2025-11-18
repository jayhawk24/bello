import Image from "next/image";
import React from "react";

interface LogoMarkProps {
    size?: number;
    className?: string;
    priority?: boolean;
    rounded?: boolean;
    src?: string;
    alt?: string;
}

export function LogoMark({
    size = 32,
    className = "",
    priority = false,
    rounded = true,
    src = "/icon.png",
    alt = "Bello hotel concierge"
}: LogoMarkProps) {
    return (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            priority={priority}
            className={`${rounded ? "rounded-full" : ""} ${className}`.trim()}
        />
    );
}

export default LogoMark;
