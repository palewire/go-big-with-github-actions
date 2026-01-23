---
name: browser-screenshots
description: Captures browser screenshots on request using Playwright for embedding in tutorials.
---

# Browser Screenshot Capture

Capture browser screenshots when the user requests them. This skill uses a Playwright-based script to automate browser interactions and save screenshots directly to disk.

## Installation

Before using this skill, install Playwright and the Chromium browser:

```bash
npm install playwright
npx playwright install chromium
```

This only needs to be done once per environment.

## When to Use

Use this skill when the user asks you to:
- Capture a screenshot of a specific URL
- Document a web page or web application state
- Take screenshots of a locally running development server
- Capture a sequence of browser interactions

## How to Capture

Use the Playwright capture script located at `skills/browser-screenshots/scripts/capture.cjs`.

### Basic Screenshot

```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://example.com \
  --output static/screenshots/week-1/example-homepage.png
```

### Common Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url` | URL to capture (required) | - |
| `--output` | Output file path (required) | - |
| `--width` | Viewport width | 1280 |
| `--height` | Viewport height | 800 |
| `--fullpage` | Capture full scrollable page | false |
| `--element` | CSS selector to capture specific element | - |
| `--highlight` | CSS selector to highlight with red border | - |
| `--execute` | JavaScript to run before capture | - |
| `--wait` | Milliseconds to wait before capture | 500 |
| `--dark` | Use dark color scheme | false |

### Examples

**Capture with dark mode:**
```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://code.visualstudio.com \
  --dark \
  --output docs/_static/vscode-homepage.png
```

**Highlight a specific element:**
```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://github.com/new \
  --highlight ".repo-name-input" \
  --output docs/_static/github-repo-name.png
```

**Capture a specific element only:**
```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://example.com \
  --element ".hero-section" \
  --output docs/_static/hero-only.png
```

**Execute JavaScript before capture (e.g., click a button):**
```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://example.com \
  --execute "document.querySelector('button').click()" \
  --wait 1000 \
  --output docs/_static/after-click.png
```

**Full page screenshot:**
```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://example.com \
  --fullpage \
  --output docs/_static/full-page.png
```

## Saving Screenshots

Save to `docs/_static/` with descriptive kebab-case filenames.

**Naming convention:** Use kebab-case:
-  `github-new-repo.png`
-  `homepage-hero-section.png`
- L `GitHubNewRepo.png`

**Example structure:**
```
docs/_static/
  github-new-repo.png
  actions-homepage.png
  vscode-settings.png
```

## Embedding in Documentation

When embedding screenshots in Sphinx/MyST markdown documentation, use standard image syntax:

```markdown
![GitHub new repository form](/_static/github-new-repo.png)
```

Or with additional attributes:

```markdown
```{figure} /_static/github-new-repo.png
:alt: GitHub new repository form
:width: 80%

Creating a new repository on GitHub
```
```

## Limitations

- **Cannot capture:** VS Code windows, terminal output, system dialogs (these require manual screenshots)
- **Requires network access:** URLs must be reachable from the machine running the script