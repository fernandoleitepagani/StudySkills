import test from "node:test";
import assert from "node:assert/strict";
import { inspectMath } from "../core/scripts/lib/math.mjs";

test("math: counts balanced inline and display formulas", () => {
  const result = inspectMath("The slope is $m = 2$.\n\n$$\ny = 2x + 1\n$$\n");
  assert.equal(result.ok, true);
  assert.equal(result.counts.inlineFormulas, 1);
  assert.equal(result.counts.displayFormulas, 1);
  assert.equal(result.counts.formulas, 2);
  assert.equal(result.rendering, "latex");
});

test("math: rejects unclosed inline math", () => {
  const result = inspectMath("The slope is $m = 2.");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "UNCLOSED_INLINE_MATH"), true);
});

test("math: rejects unclosed display math", () => {
  const result = inspectMath("$$\ny = 2x + 1\n");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "UNCLOSED_DISPLAY_MATH"), true);
});

test("math: accepts a valid latex-graph block", () => {
  const result = inspectMath([
    "```latex-graph",
    "\\begin{tikzpicture}",
    "\\begin{axis}[xlabel={$x$}, ylabel={$y$}]",
    "\\addplot[domain=-2:2] {x^2};",
    "\\end{axis}",
    "\\end{tikzpicture}",
    "```",
    "Caption: Graph of $y = x^2$.",
  ].join("\n"));
  assert.equal(result.ok, true);
  assert.equal(result.counts.graphs, 1);
  assert.equal(result.counts.formulas, 1);
});

test("math: rejects a graph without tikzpicture or axis", () => {
  const result = inspectMath("```latex-graph\n\\draw (0,0) -- (1,1);\n```\nCaption: A line.");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "GRAPH_NO_AXIS"), true);
});

test("math: rejects a graph without a caption", () => {
  const result = inspectMath("```latex-graph\n\\begin{axis}\\end{axis}\n```");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "GRAPH_NO_CAPTION"), true);
});

test("math: rejects an image without alt text", () => {
  const result = inspectMath("![](assets/graph.png)\nCaption: A graph.");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "IMAGE_NO_ALT"), true);
});

test("math: rejects an image without a caption", () => {
  const result = inspectMath("![A graph](assets/graph.png)");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "IMAGE_NO_CAPTION"), true);
});

test("math: rejects forbidden LaTeX commands", () => {
  const result = inspectMath("\\write18{rm -rf /}");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "FORBIDDEN_LATEX_COMMAND"), true);
});

test("math: rejects absolute input paths", () => {
  const result = inspectMath("\\input{/etc/passwd}");
  assert.equal(result.ok, false);
  assert.equal(result.issues.some((item) => item.code === "ABSOLUTE_LATEX_PATH"), true);
});

test("math: counts graphs and images", () => {
  const result = inspectMath([
    "![A graph](assets/graph.png)",
    "Caption: A graph.",
    "",
    "```latex-graph",
    "\\begin{axis}\\end{axis}",
    "```",
    "Caption: A plot.",
  ].join("\n"));
  assert.equal(result.ok, true);
  assert.equal(result.counts.images, 1);
  assert.equal(result.counts.graphs, 1);
});

test("math: reports rendering mode and required math", () => {
  assert.equal(inspectMath("$x$", { latexAvailable: false }).rendering, "plain");
  assert.equal(inspectMath("![A](a.png)\nCaption: A.").rendering, "image");
  const missing = inspectMath("No math here.", { required: true });
  assert.equal(missing.ok, false);
  assert.equal(missing.issues.some((item) => item.code === "MATH_REQUIRED_EMPTY"), true);
});
