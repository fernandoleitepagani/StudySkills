const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "-",
  mdash: "-",
  hellip: "...",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  copy: "(c)",
  reg: "(r)",
  trade: "(tm)",
  deg: " deg",
  plusmn: "+/-",
  times: "x",
  divide: "/",
};

function decodeEntities(text) {
  return String(text ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&([a-z]+);/gi, (match, name) => {
      const value = NAMED_ENTITIES[name.toLowerCase()];
      return value === undefined ? match : value;
    });
}

function stripDangerousBlocks(html) {
  return String(html ?? "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head\b[\s\S]*?<\/head>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ");
}

export function htmlToText(html) {
  if (!html) return "";

  let text = stripDangerousBlocks(html);

  text = text.replace(
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => {
      const cleanLabel = label.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const cleanHref = decodeEntities(href).trim();
      if (!cleanLabel) return cleanHref ? ` ${cleanHref} ` : " ";
      if (!cleanHref || cleanHref.startsWith("javascript:")) return ` ${cleanLabel} `;
      return ` [${cleanLabel}](${cleanHref}) `;
    },
  );

  text = text
    .replace(/<h1\b[^>]*>/gi, "\n\n# ")
    .replace(/<h2\b[^>]*>/gi, "\n\n## ")
    .replace(/<h3\b[^>]*>/gi, "\n\n### ")
    .replace(/<h4\b[^>]*>/gi, "\n\n#### ")
    .replace(/<h5\b[^>]*>/gi, "\n\n##### ")
    .replace(/<h6\b[^>]*>/gi, "\n\n###### ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|footer|blockquote|tr|ul|ol|table)>/gi, "\n\n")
    .replace(/<hr\s*\/?>/gi, "\n\n---\n\n")
    .replace(/<strong\b[^>]*>|<b\b[^>]*>/gi, "**")
    .replace(/<\/strong>|<\/b>/gi, "**")
    .replace(/<em\b[^>]*>|<i\b[^>]*>/gi, "*")
    .replace(/<\/em>|<\/i>/gi, "*")
    .replace(/<\/td>|<\/th>/gi, " | ")
    .replace(/<td\b[^>]*>|<th\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  text = decodeEntities(text);

  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t\f\v]+/g, " ").trimEnd())
    .map((line) => (line.startsWith(" ") ? line.replace(/^ +/, "") : line));

  const cleaned = [];
  let blankCount = 0;
  for (const line of lines) {
    if (!line.trim()) {
      blankCount += 1;
      if (blankCount <= 1 && cleaned.length > 0) cleaned.push("");
      continue;
    }
    blankCount = 0;
    cleaned.push(line);
  }

  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function summarizeHtml(html, maxLength = 500) {
  const text = htmlToText(html).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - 3)).trimEnd() + "...";
}
