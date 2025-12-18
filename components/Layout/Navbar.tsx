import { FC } from "react";

export const Navbar: FC = () => {
  return (
    <div className="h-[50px] sm:h-[60px] border-b border-neutral-300 py-2 flex items-center">
      <a
        className="font-bold text-2xl hover:opacity-70 px-4 sm:px-10"
        href="https://code-scaffold.vercel.app"
      >
        Chat
      </a>
    </div>
  );
};
