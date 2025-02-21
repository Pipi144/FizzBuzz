"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  itemText: string;
  itemUrl: string;
};

const MenuItem = ({ itemText, itemUrl }: Props) => {
  const currentPath = usePathname();
  return (
    <Link
      href={itemUrl}
      className={`mx-2 ${
        currentPath.startsWith(itemUrl)
          ? "text-cyan-400 font-bold"
          : "text-white font-[400]"
      } font-concert text-base hover:underline ml-5`}
    >
      {itemText}
    </Link>
  );
};

export default MenuItem;
