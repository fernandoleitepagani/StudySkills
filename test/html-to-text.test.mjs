import test from "node:test";
import assert from "node:assert/strict";
import { htmlToText } from "../skills/study/canvas-study/scripts/lib/html-to-text.mjs";

test("html: keeps headings, paragraphs, lists, and links", () => {
  const text = htmlToText(
    "<h1>Title</h1><p>Hello <strong>world</strong> and <em>friends</em>.</p><ul><li>One</li><li>Two</li></ul><p><a href=\"https://example.com\">Example</a></p>",
  );
  assert.match(text, /^# Title/m);
  assert.match(text, /Hello \*\*world\*\* and \*friends\*\./);
  assert.match(text, /- One/);
  assert.match(text, /- Two/);
  assert.match(text, /\[Example\]\(https:\/\/example\.com\)/);
});

test("html: removes scripts, styles, and comments", () => {
  const text = htmlToText(
    "<style>body { color: red; }</style><script>alert('x')</script><!-- hidden --><p>Visible</p>",
  );
  assert.equal(text, "Visible");
});

test("html: decodes named and numeric entities", () => {
  const text = htmlToText("<p>&amp; &lt; &gt; &quot; &#39; &#x41; &nbsp;</p>");
  assert.equal(text, "& < > \" ' A");
});

test("html: converts links and ignores javascript links", () => {
  const text = htmlToText(
    "<p><a href=\"https://example.com/a?x=1&amp;y=2\">A</a> <a href=\"javascript:alert(1)\">Bad</a></p>",
  );
  assert.match(text, /\[A\]\(https:\/\/example\.com\/a\?x=1&y=2\)/);
  assert.match(text, /Bad/);
  assert.equal(text.includes("javascript:"), false);
});

test("html: handles empty and null input", () => {
  assert.equal(htmlToText(null), "");
  assert.equal(htmlToText(""), "");
  assert.equal(htmlToText("   "), "");
});

test("html: collapses excessive blank lines", () => {
  const text = htmlToText("<p>A</p><p></p><p></p><p>B</p>");
  assert.equal(text, "A\n\nB");
});
