export type NavSection = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export const sections: NavSection[] = [
  { label: "Writing", href: "/writing" },
  { label: "Projects", href: "/projects" },
  { label: "Lab", href: "/lab" },
  { label: "Photos", href: "/photos" },
];

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/jordizone" },
];
