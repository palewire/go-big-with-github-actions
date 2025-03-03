# Scaling up more servers

Now that we have our initial Actions scraper going, let's try scraping several states at once. In this chapter, you'll learn how to take advantage of the parallelization capabilities of Actions.

Actions provides a feature called the matrix strategy that allows programmers to easily run different versions of the same Action in parallel using just a few extra lines of code. Instead of scraping one state, we can provide a list of states, and Actions will spin up a separate instance of the job for each state - as if we're renting multiple blank computers from Github. Instead of waiting for one scraper to finish before scraping the next state, multiple jobs can run at the same time on separate instances. Let's get started!

Examples of this technique that we've worked on include:

- An [open-source archive](https://palewi.re/docs/news-homepages/) that preserves more than 1,000 news homepages twice per day.
- The [transcription of hundreds of WNYC broadcast recordings](https://github.com/palewire/wnyc-radio-archive-transcriber) from the New York City Municipal Archive
- The [collection of WARN Act notices](https://github.com/biglocalnews/warn-github-flow) posted by dozens of different states that serves as the example for this class

First, let's copy the YAML code we worked on in the last chapter into a new workflow file. Let's call this file `matrix.yml`, and change the `name` property accordingly. For now, let's also remove the steps under `workflow-dispatch` that accept inputs, and remove the scheduling as well. We'll introduce how to combine these concepts later.

{emphasize-lines="1-4"}
```yaml
name: Matrix scraper

on:
  workflow_dispatch:

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
        run: echo "Scraped ${{ inputs.state }}" > ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"
          git add ./data/
          git commit -m "Latest data for ${{ inputs.state }}" && git push || true
```


## Matrix strategy

Now, take a look at the scraping logic we implemented earlier. Under the scrape job, we will now define the matrix strategy. Here, we provide a list of states to scrape.

{emphasize-lines="13-15"}
```yaml
name: Matrix scraper

on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    strategy:
      matrix:
        state: [ca, ia, ny]
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
        run: echo "Scraped ${{ inputs.state }}" > ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"
          git add ./data/
          git commit -m "Latest data for ${{ inputs.state }}" && git push || true
```

In our original scraper, we combined scraping and committing in a single step because we weren't worried about pulling the latest repo changes first. But with multiple jobs running in parallel, we can no longer guarantee their order of completion. In this chapter, we'll solve that by splitting the action into two steps.

First, we'll run all scrapers in parallel and save their outputs in a temporary storage known as artifacts.

Then, once every job finishes, we'll collect those Artifacts and make a single commit. This approach ensures that all parallel jobs contribute their changes properly, without overwriting each other.

### Error handling
Github Actions provides two error-handling settings that will be helpful. One is called ```fail-fast```. This flag controls whether the entire matrix job should fail if one job in the matrix fails. In our case, we want to mark this flag as false; even if one state's scraper fails, we still want the job to complete and continue scraping the other states.

{emphasize-lines="7"}
```yaml
jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    continue-on-error: true
    strategy:
      fail-fast: false
      matrix:
        state: [ca, ia, ny]

```

The second error-handling setting is called ```continue-on-error```. When true, this allows for the Action to continue running subsequent steps even if an earlier step failed. Since our Action has multiple jobs -- a build job and a commit job -- we want the Action to continue running even if one of the scrapes failed earlier.

{emphasize-lines="5"}
```yaml
jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    continue-on-error: true
    strategy:
      fail-fast: false
      matrix:
        state: [ca, ia, ny]

```

To accommodate our matrix strategy, we'll also modify all the steps that use the `inputs.state` variable to use `matrix.state` instead. For example, in the `Hello world` step, we can change the line to:

{emphasize-lines="3"}
```yaml
steps:
      - name: Hello world
        run: echo "Scraping data for ${{ matrix.state }}"
```

And we should do the same for the scraping step. For simplicity, let's cut that datestamp step for now.

{emphasize-lines="20,34"}
```yaml
name: Matrix scraper

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
```

## Uploading artifact

Now that we've scraped our data, we need a place to store the data before we commit it to the repo. To do this, we are using Actions Artifacts. Artifacts allow you to persist data after a job has completed, and share that data with another job in the same workflow. An artifact is a file or collection of files produced during a workflow run.

Here we are using the shortcut actions/upload-artifact created by Github that allows us to temporarily store our data within our task.

{emphasize-lines="36-40"}
```yaml
name: Matrix scraper

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
          path: ./data/${{ matrix.state }}.csv
```

## Commit step

Next, let's create a second step for our Action: the commit step. We'll start with the standard step of checking out the code. Notice that the step needs the scrape step, which ensures that it will not run until our first step has finished.

{emphasize-lines="4"}

```yaml
  commit:
      name: Commit
      runs-on: ubuntu-latest
      needs: scrape
      steps:
        - name: Checkout
          uses: actions/checkout@v4
```

The next step is to download the artifacts we previously stored for use in this step. This is done using the actions/download-artifact companion to the uploader.

{emphasize-lines="9-13"}

```yaml
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
```

Just to make sure our repo stays clean, we can add a `Move` step to unpack the artifacts - which are all stored in their own folders, since they came from different parallel jobs - and put them into our `data/` folder. Lastly, we push with the same code as before.

{emphasize-lines="15-18"}
```yaml
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
```

We can add a logging step here that will save the current date and time to a file. This will help us keep track of when the last scrape was done and prevent GitHub from deactivating the workflow.

{emphasize-lines="20-21"}
```yaml
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

      - name: Save datestamp
        run: date > ./data/latest-scrape.txt
```

Finally, we can add the same commit and push step as before. This time, we don't need to specify the state in the commit message, since all states are now included in the data folder.

{emphasize-lines="23-28"}
```yaml
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

      - name: Save datestamp
        run: date > ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"
          git add ./data/
          git commit -m "Latest data" && git push || true
```

All together, our final code should look like this:

```yaml
name: Matrix scraper

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
          path: ./data/${{ matrix.state }}.csv

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

      - name: Save datestamp
        run: date > ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"
          git add ./data/
          git commit -m "Latest data" && git push || true
```

## TK SCREENSHOTS


## Extending our Action

Now that we've successfully created a parallel action, let's try adding back our inputs.

We can modify our input to be able to accept a list of multiple states, instead of just one state. (Since this is a demo, we will not be adding data validation, but in a real world use case you should consider adding some code to validate the input is a list!)

{emphasize-lines="6-9"}
```yaml
name: Scraper with matrix

on:
  workflow_dispatch:
    inputs:
      states:
        description: 'List of U.S. states to scrape (e.g., [ca, ia, ny])'
        required: true
        default: '[ca, ia, ny]'

permissions:
  contents: write
```

Then, in the section where we define our matrix strategy, we can tell our Github Actions file to grab the JSON list from the input, and defines those elements as the states to be used for the matrix.

{emphasize-lines="7"}
```yaml
jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    strategy:
      matrix:
        state: ${{ fromJSON(inputs.states) }}
```

What happens when we try to scrape a state that doesn't exist in the scraper? For example, MN WARN notices are not supported by Big Local News' WARN Scraper. Let's try inputting:

```
[mn, ca, ny]
```

### TK - screenshot of result

We can see here that `fail-fast` and `continue-on-error` resulted in the data for `ca` and `ny` to still be scraped, even though the MN scraper failed.
