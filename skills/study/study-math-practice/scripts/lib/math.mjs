import fs from "node:fs/promises";
import path from "node:path";

const FORBIDDEN_COMMANDS = [
  "write18",
  "input",
  "include",
  "openout",
  "read",
  "immediate",
  "special",
];

const FORBIDDEN_PATTERN = new RegExp(`\\\\(${FORBIDDEN_COMMANDS.join("|")})\\b`, "g");
const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function issue(code, message, line = null) {
  return line ? { code, message, line } : { code, message };
}

function isAbsoluteTarget(target) {
  if (!target) return false;
  if (target.startsWith("/") || target.startsWith("\\\\")) return true;
  if (/^[A-Za-z]:[\\/]/.test(target)) return true;
  return path.isAbsolute(target);
}

function stripInlineCode(line) {
  return line.replace(/(`+)([^`]*?)\1/g, (match) => " ".repeat(match.length));
}

function scanDollarMath(text) {
  let inline = 0;
  let display = 0;
  let openInline = false;
  let openDisplay = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === "\\") {
      index += 1;
      continue;
    }
    if (char !== "$") continue;

    if (text[index + 1] === "$") {
      if (openDisplay) {
        openDisplay = false;
        display += 1;
      } else if (openInline) {
        openInline = false;
        inline += 1;
      } else {
        openDisplay = true;
      }
      index += 1;
      continue;
    }

    if (openDisplay) continue;
    if (openInline) {
      openInline = false;
      inline += 1;
    } else {
      openInline = true;
    }
  }

  return {
    inline,
    display,
    unclosedInline: openInline,
    unclosedDisplay: openDisplay,
  };
}

function nextNonEmptyLine(lines, start) {
  for (let index = start; index < lines.length; index += 1) {
    if (lines[index].trim()) return { line: lines[index], index };
  }
  return null;
}

function hasCaption(value) {
  return /^\s*Caption:\s*\S/i.test(value);
}

export function inspectMath(text, options = {}) {
  const lines = String(text ?? "").split(/\r?\n/);
  const prose = [];
  const graphs = [];
  const issues = [];
  let fence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!fence) {
      const opening = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (opening) {
        fence = {
          marker: opening[1][0],
          length: opening[1].length,
          language: opening[2].trim().split(/\s+/)[0].toLowerCase(),
          startLine: index + 1,
          content: [],
        };
        continue;
      }
      prose.push({ line, number: index + 1 });
      continue;
    }

    const closing = line.match(/^\s*(`{3,}|~{3,})\s*$/);
    if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) {
      if (fence.language === "latex-graph") {
        graphs.push({
          startLine: fence.startLine,
          endLine: index + 1,
          content: fence.content.join("\n"),
        });
      }
      fence = null;
      continue;
    }
    fence.content.push(line);
  }

  if (fence) {
    issues.push(issue("UNCLOSED_FENCE", "A code fence is not closed.", fence.startLine));
    if (fence.language === "latex-graph") {
      graphs.push({
        startLine: fence.startLine,
        endLine: lines.length,
        content: fence.content.join("\n"),
      });
    }
  }

  const proseText = prose.map((item) => stripInlineCode(item.line)).join("\n");
  const dollars = scanDollarMath(proseText);
  if (dollars.unclosedInline) {
    issues.push(issue("UNCLOSED_INLINE_MATH", "Inline math is missing its closing $."));
  }
  if (dollars.unclosedDisplay) {
    issues.push(issue("UNCLOSED_DISPLAY_MATH", "Display math is missing its closing $$."));
  }

  let images = 0;
  for (const item of prose) {
    const line = stripInlineCode(item.line);
    for (const match of line.matchAll(IMAGE_PATTERN)) {
      images += 1;
      const alt = (match[1] ?? "").trim();
      const target = (match[2] ?? "").trim();
      if (!alt) {
        issues.push(issue("IMAGE_NO_ALT", "Every image needs alt text.", item.number));
      }
      if (isAbsoluteTarget(target)) {
        issues.push(issue("ABSOLUTE_IMAGE_PATH", "Image paths must be relative.", item.number));
      }
      const sameLineCaption = line.slice((match.index ?? 0) + match[0].length);
      const next = nextNonEmptyLine(lines, item.number);
      if (!hasCaption(sameLineCaption) && !(next && hasCaption(next.line))) {
        issues.push(issue("IMAGE_NO_CAPTION", "Every image needs a Caption line.", item.number));
      }
    }
  }

  for (const graph of graphs) {
    if (!/\\begin\{(tikzpicture|axis)\}/.test(graph.content)) {
      issues.push(issue("GRAPH_NO_AXIS", "A latex-graph block needs tikzpicture or axis.", graph.startLine));
    }
    const next = nextNonEmptyLine(lines, graph.endLine);
    if (!next || !hasCaption(next.line)) {
      issues.push(issue("GRAPH_NO_CAPTION", "Every graph needs a Caption line.", graph.startLine));
    }
  }

  for (const graph of graphs) {
    for (const match of graph.content.matchAll(FORBIDDEN_PATTERN)) {
      issues.push(issue("FORBIDDEN_LATEX_COMMAND", `Forbidden LaTeX command: \\${match[1]}.`));
    }
    for (const match of graph.content.matchAll(/\\(?:input|include|includegraphics)\s*\{([^}]+)\}/g)) {
      if (isAbsoluteTarget(match[1].trim())) {
        issues.push(issue("ABSOLUTE_LATEX_PATH", "LaTeX asset paths must be relative."));
      }
    }
  }

  for (const match of proseText.matchAll(FORBIDDEN_PATTERN)) {
    issues.push(issue("FORBIDDEN_LATEX_COMMAND", `Forbidden LaTeX command: \\${match[1]}.`));
  }
  for (const match of proseText.matchAll(/\\(?:input|include|includegraphics)\s*\{([^}]+)\}/g)) {
    if (isAbsoluteTarget(match[1].trim())) {
      issues.push(issue("ABSOLUTE_LATEX_PATH", "LaTeX asset paths must be relative."));
    }
  }

  const counts = {
    formulas: dollars.inline + dollars.display,
    inlineFormulas: dollars.inline,
    displayFormulas: dollars.display,
    graphs: graphs.length,
    images,
  };

  let rendering = options.rendering;
  if (!rendering) {
    if (options.latexAvailable === false && (counts.formulas > 0 || counts.graphs > 0)) {
      rendering = "plain";
    } else if (counts.formulas > 0 || counts.graphs > 0) {
      rendering = "latex";
    } else if (counts.images > 0) {
      rendering = "image";
    } else {
      rendering = "plain";
    }
  }

  const fallback = options.fallback ?? (rendering === "plain" ? "plain" : null);
  if (options.required === true && counts.formulas + counts.graphs + counts.images === 0) {
    issues.push(issue("MATH_REQUIRED_EMPTY", "Math is required but the document has no formulas, graphs, or images."));
  }

  return {
    ok: issues.length === 0,
    issues,
    counts,
    rendering,
    fallback,
  };
}

export async function inspectMathFile(file, options = {}) {
  const text = await fs.readFile(file, "utf8");
  return inspectMath(text, options);
}
