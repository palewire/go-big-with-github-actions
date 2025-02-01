# GitHub Actions scrapers

This chapter that Iris will write will show how to expand the basic action to scraper data on a cron and commit the results to the repo.

It will gradually build up to something like:

```yaml
name: First Scraper

on:
  workflow_dispatch:
    inputs:
      state:
        description: 'U.S. state to scrape'
        required: true
        default: 'ia'
  cron:
    - '0 0 * * *'

permissions:
  contents: write

jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    steps:
      - name: Hello world
        run: echo "Scraping data for ${{ inputs.state }}"

      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install scraper
        run: pip install warn-scraper

      - name: Scrape
        run: warn-scraper ${{ inputs.state }} --data-dir ./data/

      - name: Save datestamp
        run: date > ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data for ${{ inputs.state }}" && git push || true
```

Examples to hype:

- [LAT coronavirus scrapers](https://github.com/datadesk/california-coronavirus-scrapers)
- [USDA animal inspections](https://github.com/data-liberation-project/aphis-inspection-reports)
- [fed-dot-plot-scraper](https://github.com/palewire/fed-dot-plot-scraper)