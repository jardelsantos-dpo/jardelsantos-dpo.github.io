const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();

const BASE_URL = process.env.BASE_URL || "https://jardelsantos-dpo.github.io";
const SITE_TITLE = "Portal de Segurança e Tecnologia";
const SITE_DESCRIPTION = "Conteúdos sobre segurança da informação, IA e gestão de TI.";

const OUTPUT_SITEMAP = path.join(ROOT, "sitemap.xml");
const OUTPUT_RSS = path.join(ROOT, "rss.xml");
const OUTPUT_ROBOTS = path.join(ROOT, "robots.txt");

const ARTIGOS_FILE = path.join(ROOT, "assets/js/artigos-dados.js");

function getGitDate(file) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${file}"`, { encoding: "utf8" }).trim();
    return out || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function loadArtigos() {

  if (!fs.existsSync(ARTIGOS_FILE)) return [];

  const raw = fs.readFileSync(ARTIGOS_FILE, "utf8");

  const lista = new Function(raw + "; return listaArtigos;")();

  return lista
    .filter(a => a.link)
    .map(a => {

      const loc = `${BASE_URL}/${a.link}`;

      return {
        title: a.titulo || "Artigo",
        description: a.resumo || "",
        category: a.categoria || "Artigos",
        loc,
        lastmod: (a.data || new Date().toISOString()).substring(0,10),
        date: new Date(a.data || Date.now()),
        priority: "0.6"
      };

    });

}

function collectStaticPages() {

  const files = fs.readdirSync(ROOT);

  const pages = [];

  for (const file of files) {

    if (!file.endsWith(".html")) continue;
    if (file === "404.html") continue;

    const loc = file === "index.html"
      ? `${BASE_URL}/`
      : `${BASE_URL}/${file}`;

    const lastmod = getGitDate(file).substring(0,10);

    let priority = "0.5";

    if (file === "index.html") priority = "1.0";

    if (["sobre.html","artigos.html","servicos.html"].includes(file))
      priority = "0.8";

    pages.push({
      title: file.replace(".html",""),
      loc,
      lastmod,
      priority
    });

  }

  return pages;

}

function buildSitemap(urls) {

  const xml = urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xml}
</urlset>`;
}

function buildRSS(artigos) {

  const items = artigos
    .sort((a,b)=> b.date - a.date)
    .slice(0,20)
    .map(a=>`

<item>
<title>${a.title}</title>
<link>${a.loc}</link>
<description><![CDATA[${a.description}]]></description>
<category>${a.category}</category>
<pubDate>${a.date.toUTCString()}</pubDate>
<guid>${a.loc}</guid>
</item>
`).join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>

<title>${SITE_TITLE}</title>
<link>${BASE_URL}</link>
<description>${SITE_DESCRIPTION}</description>

${items}

</channel>
</rss>`;

}

function buildRobots() {

  return `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

}

function main() {

  const artigos = loadArtigos();

  const pages = collectStaticPages();

  const sitemapUrls = [
    ...pages,
    ...artigos
  ].sort((a,b)=>a.loc.localeCompare(b.loc));

  const sitemap = buildSitemap(sitemapUrls);

  const rss = buildRSS(artigos);

  const robots = buildRobots();

  fs.writeFileSync(OUTPUT_SITEMAP, sitemap);
  fs.writeFileSync(OUTPUT_RSS, rss);
  fs.writeFileSync(OUTPUT_ROBOTS, robots);

  console.log("SEO files generated");
  console.log("URLs:", sitemapUrls.length);
  console.log("RSS articles:", artigos.length);

}

if (require.main === module) main();