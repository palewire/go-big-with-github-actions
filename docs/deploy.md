# Deploy a data dashboard

This chapter, which Ben will write, will show to deploy a data dashboard with your latest scrape using GitHub Pages.

This will build up to:

```yaml
name: Scrape and deploy

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install scraper
        run: pip install warn-scraper

      - name: Scrape
        run: warn-scraper ia --data-dir ./data/

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data" && git push || true

      - name: upload-artifact
        uses: actions/upload-artifact@v4
        with:
          name: data
          path: ./data/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: scrape
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.11"

      - name: Install dependencies
        run: npm install --prefix site
        shell: bash

      - name: Build
        run: npm run build --prefix site
        shell: bash

      - name: Upload release candidate
        uses: actions/upload-pages-artifact@v3
        with:
          path: "site/dist"

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```