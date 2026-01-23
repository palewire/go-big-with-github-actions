# AGENTS.MD

This repository is a tutorial + reference implementation for “Go big with GitHub Actions”.
It contains:

- A Sphinx documentation site under `docs/` (published to https://palewi.re/docs/go-big-with-github-actions/).
- Example GitHub Actions workflows under `.github/workflows/` demonstrating scraping, matrices, Pages deploys, and custom EC2 runners.
- A small Observable Framework dashboard under `site/` used in the deployment chapter.
- Sample scraped datasets under `data/`.

If you are an automated coding agent working in this repo, optimize for small, reviewable changes and keep the tutorial narrative consistent with the example code.

## What changes are “in scope”

Common, safe changes:

- Fix typos and broken links in `docs/`.
- Update or correct workflow YAML examples in `.github/workflows/`.
- Update the Observable app in `site/` (content, build config, small UX improvements).
- Refresh documentation build/deploy automation.

Changes to avoid unless explicitly requested:

- Large refactors of the tutorial structure or tone.
- Renaming workflow files or chapter filenames (links/bookmarks may break).
- Introducing new heavy dependencies.

## Project layout

- `docs/`: Sphinx + MyST markdown documentation.
  - Primary entry point: `docs/index.md`
  - Sphinx config: `docs/conf.py`
  - Build output (local): `docs/_build/`
- `.github/workflows/`: Example Actions workflows used by the tutorial.
  - Docs build/deploy: `.github/workflows/docs.yaml`
  - Scrape + Pages deploy: `.github/workflows/scrape-and-deploy.yaml`
  - Matrix scraping example: `.github/workflows/scraper-with-matrix.yaml`
  - EC2 runner examples: `.github/workflows/reusable-ec2-job.yaml`, `.github/workflows/ec2-custom-runner.yaml`
- `site/`: Observable Framework app used for the dashboard deployment chapter.
  - Config: `site/observablehq.config.js`
  - Source: `site/src/` (Markdown pages + data loaders/static data)
  - Build output: `site/dist/` (generated)
- `data/`: Scraper outputs committed by workflows (CSV files).

## Tooling

### Python (docs)

- Python requirement: **3.12** (see `pyproject.toml`).
- Dependency manager: **uv** (see `uv.lock`).
- Docs stack: Sphinx + MyST.

### JavaScript (dashboard)

- Node requirement: `>=18` (the workflows use Node **20.11**).
- Package manager: npm (see `site/package.json`).

### Formatting / linting

This repo uses `pre-commit` with:

- `ruff` + `ruff-format`
- `mypy`
- `blacken-docs` (formats Python snippets inside docs)
- standard whitespace/yaml/json checks

## Common commands

Run these from the repository root unless stated otherwise.

### Install (docs)

- Install Python deps using uv:
  - `uv sync`

### Live docs server

- Start live-reloading docs server (clears build output first):
  - `make serve`

This runs the Sphinx autobuild server (typically http://localhost:8000).

### Build docs (one-off)

- Build HTML docs:
  - `uv run sphinx-build -M html ./docs ./_build/`

### Lint/format (recommended via pre-commit)

- Run all configured checks:
  - `uv run pre-commit run --all-files`

If you are making doc changes, ensure `check-yaml`, `ruff-format`, and `blacken-docs` pass.

### Observable dashboard (site)

- Install deps:
  - `npm install --prefix site`
- Local preview server:
  - `npm run dev --prefix site`
- Build static output:
  - `npm run build --prefix site`

## CI / automation notes

### Docs pipeline

- `.github/workflows/docs.yaml` builds Sphinx docs using `uv sync` and uploads artifacts.
- On `main`, it deploys to S3 using `datadesk/delivery-deploy-action@v1`.
- Deployment requires AWS secrets (`DOCS_AWS_*`) configured in the GitHub repo settings.

### Scrape + deploy pipeline

- `.github/workflows/scrape-and-deploy.yaml`:
  - Scrapes Iowa WARN data using `warn-scraper` and commits results into `data/`.
  - Builds the Observable site and deploys it to GitHub Pages.

When editing this workflow, keep in mind:

- It uses `permissions: contents: write` to allow committing scraped data.
- Pages deploy uses `actions/upload-pages-artifact` + `actions/deploy-pages`.

### Matrix scraping example

- `.github/workflows/scraper-with-matrix.yaml` demonstrates:
  - `strategy.matrix` to run multiple scrapes in parallel.
  - Artifact fan-in and a follow-up commit job.

### EC2 runner example

- `.github/workflows/reusable-ec2-job.yaml` provisions an ephemeral self-hosted runner on AWS EC2 via `machulav/ec2-github-runner@v2`.
- `.github/workflows/ec2-custom-runner.yaml` calls the reusable workflow.

These workflows are tutorial examples; treat them as reference code and be cautious about changing default regions/AMI IDs/instance types without a specific request.

## Conventions for agents

- Prefer minimal diffs that preserve the tutorial’s intent.
- Keep workflow examples readable: clear step names, consistent quoting, and stable action versions.
- Avoid changing public URLs and file names referenced by the docs unless you also update links and navigation.
- Do not commit generated build artifacts such as `docs/_build/` or `site/dist/`.
- If you adjust dependencies:
  - For Python: update `pyproject.toml` and regenerate `uv.lock` (via `uv sync`).
  - For Node: update `site/package.json` and `site/package-lock.json` if present.

## Quick “sanity check” before opening a PR

- `uv run pre-commit run --all-files`
- `make serve` (ensure docs build locally)
- If you touched `site/`: `npm run build --prefix site`
