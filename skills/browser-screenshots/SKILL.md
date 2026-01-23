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

## Authentication

To capture screenshots of authenticated pages (e.g., logged-in GitHub views), you need to save your authentication state first.

### Save Authentication State

Use the `save-auth.cjs` script to log in and save your session:

```bash
node skills/browser-screenshots/scripts/save-auth.cjs \
  --url https://github.com/login \
  --output ~/.playwright/github-auth.json
```

This will:
1. Open a browser window
2. Allow you to log in manually
3. Wait for you to press ENTER in the terminal
4. Save your authentication state (cookies, localStorage, etc.) to the specified file

### Use Saved Authentication

Once saved, use the authentication state with the `--storageState` option:

```bash
node skills/browser-screenshots/scripts/capture.cjs \
  --url https://github.com/new \
  --storageState ~/.playwright/github-auth.json \
  --output docs/_static/github-new-repo.png
```

The authentication state file can be reused for multiple screenshots until your session expires.

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

## Adding Highlight Boxes

After capturing a screenshot, you can add red highlight boxes to draw attention to specific UI elements using the `add-highlights.cjs` script.

### Finding Coordinates

Use browser developer tools to find element coordinates:
1. Right-click the element and select "Inspect"
2. In the dev tools, hover over the element
3. Note the dimensions shown (e.g., "320 × 48" and position)
4. Calculate: x (left offset), y (top offset), width, height

### Adding Highlights

```bash
node skills/browser-screenshots/scripts/add-highlights.cjs \
  --input docs/_static/screenshot.png \
  --output docs/_static/screenshot-highlighted.png \
  --boxes "295,90,880,90"
```

### Multiple Highlight Boxes

Add multiple `--boxes` parameters to highlight several areas:

```bash
node skills/browser-screenshots/scripts/add-highlights.cjs \
  --input docs/_static/screenshot.png \
  --output docs/_static/screenshot-highlighted.png \
  --boxes "295,90,880,90" \
  --boxes "295,327,880,120"
```

### Custom Styling

```bash
node skills/browser-screenshots/scripts/add-highlights.cjs \
  --input docs/_static/screenshot.png \
  --output docs/_static/screenshot-highlighted.png \
  --boxes "295,90,880,90" \
  --color "#00FF00" \
  --lineWidth 5 \
  --padding 5
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

When embedding screenshots in the documentation, use standard Markdown image syntax with relative paths:

```markdown
![GitHub new repository form](_static/github-new-repo.png)
```

For more complex figures with captions, use MyST syntax:

```markdown
```{figure} _static/github-new-repo.png
:alt: GitHub new repository form
:width: 80%

Creating a new repository on GitHub
```
```

## Limitations

- **Cannot capture:** VS Code windows, terminal output, system dialogs (these require manual screenshots)
- **Requires network access:** URLs must be reachable from the machine running the script
