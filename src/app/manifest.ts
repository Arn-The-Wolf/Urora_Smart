import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spring Farms",
    short_name: "Spring Farms",
    description: "Cattle, milk, health, stock, and daily farm work. Works on your phone, including offline.",
    start_url: "/login",
    display: "standalone",
    background_color: "#f4f7f1",
    theme_color: "#173d31",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
