import { MoveRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const navItems = [
  {
    title: "about",
    to: "",
  },
  {
    title: "events",
    to: "",
  },
  {
    title: "pricing",
    to: "",
  },
  {
    title: "contact",
    to: "",
  },
];

export default function Header() {
  return (
    <header className="fixed top-0 z-10 w-full bg-white">
      <div className="px-[5vw] py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-0">
        <div className="flex flex-1 flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-primary -mb-1">
            Ticko
          </h1>
          <span className="text-sm text-gray-500 font-light">
            Your all-in-one digital ticketing platform
          </span>
        </div>
        <nav className="flex flex-2 items-center justify-center flex-row gap-[4vw]">
          {navItems?.map((item, index) => (
            <Link key={index} href={""} className="capitalize">
              {item?.title}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end">
          <Link href={"/"} className="flex flex-row items-center justify-center gap-2">
            Login
            <MoveRight
             className="mt-1"/>
          </Link>
        </div>
      </div>
    </header>
  );
}
