# Math, graphs, and images

Use LaTeX as the source format for formulas and graphs. The harness renders the final format. LaTeX is optional at runtime.

## When to use LaTeX

Use LaTeX for:

- formulas, equations, inequalities, and matrices
- symbols, subscripts, superscripts, and units
- graphs with axes, labels, scales, and plotted functions
- quantitative exam questions and worked solutions

Plain text is enough for simple arithmetic in prose, such as `3 + 4 = 7`, and for CSV fields.

## Inline formulas

Use `$...$` for a formula inside a sentence.

```markdown
The slope is $m = \frac{y_2 - y_1}{x_2 - x_1}$.
```

Do not use Unicode-only notation for complex math. Keep variable names consistent.

## Display formulas

Use `$$...$$` for a formula on its own line.

```markdown
$$
A = \frac{1}{2} b h
$$
```

Number equations only when the document refers back to them:

```markdown
$$
F = m a \tag{1}
$$
```

Equation 1 relates force, mass, and acceleration.

## Graphs

Use a fenced `latex-graph` block with PGFPlots or TikZ.

````markdown
```latex-graph
\begin{tikzpicture}
\begin{axis}[
  xlabel={$x$},
  ylabel={$y$},
  grid=major
]
\addplot[domain=-2:2, samples=60] {x^2};
\end{axis}
\end{tikzpicture}
```
Caption: Graph of $y = x^2$.
````

Every graph needs:

- a caption
- axis labels
- units when the axes have units
- a readable scale
- a legend when there is more than one series
- a source when the data comes from a source

Prefer PGFPlots for plotted data. Prefer TikZ for diagrams and geometry.

## Images

Use Markdown image syntax with relative paths, alt text, and a caption.

```markdown
![Graph of y = x squared](assets/graph-01.png)
Caption: Graph of $y = x^2$.
```

Every image needs:

- relative path
- non-empty alt text
- caption
- source when the image comes from a source

## Format behavior

| Format | Formula | Graph | Image |
| --- | --- | --- | --- |
| PDF | Native LaTeX or harness equation renderer | PGFPlots/TikZ preferred | Relative local path, embedded |
| DOCX | Native equation or rendered SVG/PNG | Rendered SVG/PNG | Embedded PNG/SVG |
| PPTX | Rendered SVG/PNG | Rendered SVG/PNG | Embedded PNG/SVG |
| Markdown | LaTeX source | LaTeX block plus caption | Markdown image |
| CSV | Plain notation | Not supported | Not supported |

Never leave raw LaTeX in a rendered PDF, DOCX, or PPTX. Markdown outputs keep the LaTeX source. CSV outputs use plain notation.

## Fallback order

1. Native LaTeX or harness equation support.
2. Rendered SVG or PNG.
3. Plain-text notation with a reported fallback.

Report one of:

```text
Math rendering: latex
Math rendering: image fallback
Math rendering: plain-text fallback
```

## Accessibility

- Add alt text to every image.
- Add a caption to every graph and image.
- Keep labels readable in grayscale.
- Do not use color as the only signal.
- Use a text alternative for a complex diagram.
- Keep the reading order logical.
- Set the document language metadata.

## LaTeX security

If the harness or a local toolchain runs LaTeX:

- Use `-no-shell-escape`.
- Use `-interaction=nonstopmode`.
- Use `-halt-on-error`.
- Compile inside the work directory.
- Allow only relative asset paths.
- Delete auxiliary files with the work directory.
- Never install a LaTeX distribution automatically.
- Detect `pdflatex`, `dvisvgm`, and `pdftoppm` if useful, but do not require them.

Forbidden commands:

- `\write18`
- `\input`
- `\include`
- `\openout`
- `\read`
- `\immediate`
- `\special`
- Absolute file paths
- Remote includes

## Plan and checks

Quantitative outputs set:

```json
{
  "math": {
    "required": true,
    "engine": "latex",
    "fallback": "image"
  }
}
```

Record the result in `checks.json`:

```json
{
  "math": {
    "formulas": 8,
    "graphs": 2,
    "images": 1,
    "rendering": "latex",
    "fallback": null,
    "rawLatex": false
  }
}
```

Rules:

- `math.required` is true for quantitative outputs that contain formulas or graphs.
- `math.required` is false for purely textual and CSV-only outputs.
- `engine` is `latex`, `harness`, or `none`.
- `fallback` is `image`, `plain`, or `null`.
- A required math block must be reported in `checks.json`.
- If `rendering` is `plain`, `fallback` cannot be `null`.
- `rawLatex` is `false` when rendered PDF, DOCX, or PPTX files contain no raw TeX.

## Examples

### Math practice

```markdown
Solve for $x$:

$$
2x + 5 = 17
$$

The solution is $x = 6$.
```

### Exam question

```markdown
A ball falls from rest. Use $v = u + at$ to find the speed after 3 seconds.
```

### Summary formula sheet

```markdown
| Quantity | Formula |
| --- | --- |
| Speed | $v = \frac{d}{t}$ |
| Force | $F = m a$ |
```

### Notes

Keep formulas from slides and transcripts as LaTeX. Do not flatten them into ambiguous plain text.

## Validation

Run:

```bash
node <skill-dir>/scripts/core.mjs math-check --file <draft.md> --base-dir <workDir> --json
```

The scanner checks delimiters, graph blocks, axis labels, multi-series legends, image alt text, captions, asset existence, forbidden commands, and absolute paths. Validation still requires a visual inspection of the rendered file.
