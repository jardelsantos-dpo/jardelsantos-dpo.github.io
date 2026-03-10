// scripts/generate-sitemap.js
// Gera sitemap.xml usando datas editoriais do artigos-dados.js (para artigos)
// e datas de commit para páginas estáticas.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = process.cwd();
const BASE_URL = process.env.BASE_URL || "https://jardelsantos-dpo.github.io";
const OUTPUT = path.join(REPO_ROOT, "sitemap.xml");

// Caminho do seu arquivo real
const ARTIGOS_DATA_FILE = path.join(REPO_ROOT, "artigos-dados.js");

// Regras de prioridade (mantém igual ao sitemap atual)
function priorityFor(urlPath) {
  if (urlPath === "/" || urlPath === "") return "1.0";
  const name = path.basename(urlPath);
  if (["servicos.html", "sobre.html", "artigos.html"].includes(name)) return "0.8";
  if (urlPath.startsWith("/artigos/")) return "0.6";
  return "0.5";
}

// Data do último commit (para páginas estáticas)
function lastCommitISO(filePath) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, { encoding: "utf8" }).trim();
    return out || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Converte caminho/arquivo em URL
function toLoc(filePath) {
  if (filePath === "index.html") return `${BASE_URL}/`;
  return `${BASE_URL}/${filePath}`;
}

// ----------------------------
// 1) LER artigos-dados.js
// ----------------------------
function loadArtigos() {
  if (!fs.existsSync(ARTIGOS_DATA_FILE)) return [];

  const raw = fs.readFileSync(ARTIGOS_DATA_FILE, "utf8");

  // Extração simples do array (sem eval, usando Function isolada)
  const lista = new Function(raw + "; return listaArtigos;")();

  return lista
    .filter(a => a.link && a.data)
    .map(a => ({
      loc: `${BASE_URL}/${a.link}`,
      lastmod: a.data, // Já está em YYYY-MM-DD
      priority: "0.6"  // prio fixa igual às entradas do sitemap atual
    }));
}

// ----------------------------
// 2) Coletar páginas estáticas
// ----------------------------
function collectStaticPages() {
  const staticPages = [];

  const files = fs.readdirSync(REPO_ROOT);
  files.forEach(f => {
    if (f.endsWith(".html") && f !== "404.html" && f !== "index.html") {
      staticPages.push(f);
    }
  });

  // Inclui o index
  staticPages.push("index.html");

  return staticPages.map(file => {
    const loc = toLoc(file);
    const lastmod = lastCommitISO(file).substring(0,10);
    const urlPath = "/" + file.replace(/^index\.html$/, "");
    return {
      loc,
      priority: priorityFor(urlPath),
      lastmod
    };
  });
}

// ----------------------------
// 3) Construir XML final
// ----------------------------
function buildXml(urls) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const body = urls.map(u => {
    return (
`  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
    );
  }).join("\n");

  const footer = `\n</urlset>\n`;

  return header + body + footer;
}

// ----------------------------
// MAIN
// ----------------------------
function main() {
  const artigos = loadArtigos(); // datas vêm de artigos-dados.js
  const staticPages = collectStaticPages(); // datas vêm do git

  const all = [...staticPages, ...artigos];

  // Ordena por URL (melhor organização)
  all.sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = buildXml(all);
  fs.writeFileSync(OUTPUT, xml, "utf8");

  console.log(`✔ sitemap.xml atualizado. Total URLs: ${all.length}`);
}

if (require.main === module) main();