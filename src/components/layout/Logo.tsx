import Image from "next/image";
import type { ComponentProps } from "react";

export function Logo(props: ComponentProps<typeof Image>) {
  return (
    <Image
      src="/icons/DhanSathi.png"
      alt="DhanSathi logo"
      width={24}
      height={24}
      className="rounded-md object-cover"
      {...props}
    />
  );
}
