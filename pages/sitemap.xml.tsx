import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://aroohanserenityresort.com/</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://aroohanserenityresort.com/admin</loc>
      <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.3</priority>
    </url>
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default function Sitemap() {}
