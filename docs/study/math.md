# Math, graphs, and images

StudySkills uses LaTeX for formulas and graphs. The harness renders the final PDF, DOCX, PPTX, Markdown, or CSV. LaTeX is optional at runtime.

## Formulas

Inline formula:

```markdown
The slope is $m = \frac{y_2 - y_1}{x_2 - x_1}$.
```

Display formula:

```markdown
$$
A = \frac{1}{2} b h
$$
```

Number an equation only when the text refers back to it.

## Graphs

Use a `latex-graph` block with PGFPlots or TikZ.

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

Every graph needs labeled axes, units when relevant, a caption, and a legend when there is more than one series.

## Images

```markdown
![Graph of y = x squared](assets/graph-01.png)
Caption: Graph of $y = x^2$.
```

Every image needs a relative path, alt text, and a caption.

## Supported formats

| Format | Formula | Graph | Image |
| --- | --- | --- | --- |
| PDF | Native LaTeX or harness equation renderer | PGFPlots/TikZ preferred | Relative local path, embedded |
| DOCX | Native equation or rendered SVG/PNG | Rendered SVG/PNG | Embedded PNG/SVG |
| PPTX | Rendered SVG/PNG | Rendered SVG/PNG | Embedded PNG/SVG |
| Markdown | LaTeX source | LaTeX block plus caption | Markdown image |
| CSV | Plain notation | Not supported | Not supported |

## Fallback behavior

1. Native LaTeX or harness equation support.
2. Rendered SVG or PNG.
3. Plain-text notation with a reported fallback.

The final report states:

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
- Use a text alternative for complex diagrams.
- Keep the reading order logical.

## Security

StudySkills does not install LaTeX. If a local toolchain runs it:

- shell escape is disabled
- file input and output commands are blocked
- absolute paths are rejected
- compilation stays in the work directory
- auxiliary files are deleted with the work directory

## Examples

Math practice:

```markdown
Solve for $x$:

$$
2x + 5 = 17
$$
```

Exam question:

```markdown
A ball falls from rest. Use $v = u + at$ to find the speed after 3 seconds.
```

Summary formula sheet:

| Quantity | Formula |
| --- | --- |
| Speed | $v = \frac{d}{t}$ |
| Force | $F = m a$ |

## Related docs

- [Math practice skill](../../skills/study/study-math-practice/README.md)
- [Generation performance](./performance.md)
- [Security audit](./security-audit.md)
