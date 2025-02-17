# Parallel Actions

Now that we have our initial Github Action scraper going, let's try scraping several states at once. In this chapter, you'll learn how to take advantage of the parallelization capabilities of Github Actions. 

Using Github Actions' powerful matrix strategy, we can configure the states we want to scrape in one line of YAML and Github Actions will actually spin up a separate instance of the job for each configuration - meaning, access to parallel compute units in separate virtual machines/containers. Instead of waiting for one scraper to finish before scraping the next state, multiple jobs can run at the same time on separate instances. Let's get started!

First, let's modify our input to be able to accept a list of multiple states, instead of just one state. (Since this is a demo, we will not be adding data validation, but in a real world use case you should consider adding some code to validate the input is a list!) 

```on:
  workflow_dispatch:
    inputs:
      states:
        description: 'List of U.S. states to scrape (e.g., [ca, ia, ny])'
        required: true
        default: '[ca, ia, ny]'
```

Next, take a look at the scraping logic we implemented earlier. Under the scrape job, we will now define our matrix strategy. This key will tell our Github Actions file to grab the JSON list from the input, and defines those elements as the states to be used for the matrix.

```
jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    strategy:
          matrix:
            state: ${{ fromJSON(inputs.states) }}
```

Github Actions provides two error-handling settings that will be helpful. One is called ```fail-fast```. This flag controls whether the entire matrix job should fail if one job in the matrix fails. In our case, we want to mark this flag as false; even if one state's scraper fails, we still want the job to complete and continue scraping the other states. Add the following code under the strategy key.

```
          fail-fast: false

```

The second error-handling setting is called ```continue-on-error```. This **TK**

```
continue-on-error: true
```



It will gradually build up to:

```yaml
name: Scraper with matrix

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    continue-on-error: true
    strategy:
      fail-fast: false
      matrix:
        state: [ca, ia, ny]
    steps:
      - name: Hello world
        run: echo "Scraping data for ${{ matrix.state }}"

      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install scraper
        run: pip install warn-scraper

      - name: Scrape
        run: warn-scraper ${{ matrix.state }} --data-dir ./data/

      - name: upload-artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.state }}
          path: ./data/

  commit:
    name: Commit
    runs-on: ubuntu-latest
    needs: scrape
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          pattern: '*'
          path: artifacts/

      - name: Move
        run: |
          mkdir data -p
          mv artifacts/**/*.csv data/

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data" && git push || true
```

Examples to hype:

- warn-github-flow
- news-homepages-runner
- wnyc-archive-audio-transcription
