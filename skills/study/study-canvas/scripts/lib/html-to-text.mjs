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

function attr(tag, name) {
  const match = String(tag).match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  if (!match) return "";
  return decodeEntities(match[1] ?? match[2] ?? match[3] ?? "").trim();
}

function stripTags(value) {
  return decodeEntities(
    String(value)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

function stripTagsPreserveWhitespace(value) {
  return decodeEntities(
    String(value)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  ).replace(/\r\n?/g, "\n");
}

function protectBlocks(html, placeholders) {
  let text = html;

  text = text.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, body) => {
    const code = stripTagsPreserveWhitespace(body).replace(/^\n+|\n+$/g, "");
    const token = `\u0000PRE${placeholders.length}\u0000`;
    placeholders.push(`\`\`\`\n${code}\n\`\`\``);
    return `\n\n${token}\n\n`;
  });

  text = text.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_, body) => {
    const rows = [];
    const rowMatches = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rowMatches) {
      const cells = [...row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)]
        .map((cell) => stripTags(cell[1]).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim());
      if (cells.length) rows.push(cells);
    }
    if (!rows.length) return "\n\n";
    const width = Math.max(...rows.map((row) => row.length));
    const padded = rows.map((row) => [...row, ...Array(width - row.length).fill("")]);
    const lines = [
      `| ${padded[0].join(" | ")} |`,
      `| ${Array(width).fill("---").join(" | ")} |`,
      ...padded.slice(1).map((row) => `| ${row.join(" | ")} |`),
    ];
    const token = `\u0000TBL${placeholders.length}\u0000`;
    placeholders.push(lines.join("\n"));
    return `\n\n${token}\n\n`;
  });

  text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, body) => {
    const code = stripTags(body).replace(/\n+/g, " ").trim();
    if (!code) return "";
    const token = `\u0000CODE${placeholders.length}\u0000`;
    placeholders.push(`\`${code.replace(/`/g, "\\`")}\``);
    return token;
  });

  return text;
}

function convertLists(html) {
  const re = /<\/?(ul|ol|li)\b[^>]*>/gi;
  const stack = [];
  let out = "";
  let last = 0;
  let match;
  while ((match = re.exec(html))) {
    out += html.slice(last, match.index);
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith("</");
    if (tag === "li") {
      if (!closing) {
        const indent = "  ".repeat(Math.max(0, stack.length - 1));
        const marker = stack[stack.length - 1] === "ol" ? "1. " : "- ";
        out += `\n${indent}${marker}`;
      } else {
        out += "\n";
      }
    } else if (closing) {
      stack.pop();
      out += "\n";
    } else {
      stack.push(tag);
      out += "\n";
    }
    last = re.lastIndex;
  }
  out += html.slice(last);
  return out;
}

function imageMarkdown(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = attr(tag, "src");
    if (!src || src.startsWith("data:")) return "";
    const alt = attr(tag, "alt") || "image";
    return ` ![${alt}](${src}) `;
  });
}

export function extractImageSources(html) {
  const sources = [];
  const seen = new Set();
  for (const match of String(html ?? "").matchAll(/<img\b[^>]*>/gi)) {
    const src = attr(match[0], "src");
    if (!src || src.startsWith("data:") || seen.has(src)) continue;
    seen.add(src);
    sources.push({ src, alt: attr(match[0], "alt") });
  }
  return sources;
}

export function htmlToText(html) {
  if (!html) return "";

  const placeholders = [];
  let text = stripDangerousBlocks(html);
  text = protectBlocks(text, placeholders);
  text = imageMarkdown(text);
  text = convertLists(text);

  text = text.replace(
    /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => {
      const cleanLabel = label.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const cleanHref = decodeEntities(href).trim();
      if (!cleanLabel) return cleanHref ? ` ${cleanHref} ` : " ";
      if (!cleanHref || /^\s*javascript:/i.test(cleanHref)) return ` ${cleanLabel} `;
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
    .map((line) => {
      const leading = line.match(/^[ \t\f\v]*/)?.[0] ?? "";
      const body = line.slice(leading.length).replace(/[ \t\f\v]+/g, " ").trimEnd();
      const isList = /^(?:[-*]|\d+\.)\s/.test(body);
      return isList ? leading + body : body;
    });

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

  let result = cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  for (let index = 0; index < placeholders.length; index += 1) {
    result = result.replace(`\u0000PRE${index}\u0000`, placeholders[index]);
    result = result.replace(`\u0000TBL${index}\u0000`, placeholders[index]);
    result = result.replace(`\u0000CODE${index}\u0000`, placeholders[index]);
  }

  return result.replace(/\u0000(PRE|TBL|CODE)\d+\u0000/g, "").trim();
}

export function summarizeHtml(html, maxLength = 500) {
  const text = htmlToText(html).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - 3)).trimEnd() + "...";
}
