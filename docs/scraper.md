# Scraping Data

## Web scrapers that run on GitHub Actions

Web scrapers can be a useful tool collect large amounts of data quickly. GitHub Action takes automation to next level by allowing you to schedule scrapers and run many at the same time. 

Below are some examples of scrapers that are run by GitHub Actions. In this chapter we will learn how to use Action to run web scrapers.

- [LAT coronavirus scrapers](https://github.com/datadesk/california-coronavirus-scrapers)
- [USDA animal inspections](https://github.com/data-liberation-project/aphis-inspection-reports)
- [fed-dot-plot-scraper](https://github.com/palewire/fed-dot-plot-scraper)

## What you will learn

1. Install an existing web scraper from PyPI, run it and `commit` results to your repo.
2. Set up a `cron` so you can "set it and forget it".
3. Add `inputs` so you can have more control over what to scrape.

## Create a new workflow

Let's start a new workflow file

![new](_static/scraper-1.png)

Again, we will be setting up our own workflow file. This time let's call this file `scraper`.

![blank](_static/scraper-2.png)


## Write your workflow file

Let's start with a `name` and expand the `on` parameter by adding a `cron`. Here, we've added a cron expression that will run the Action everyday at 00:00 UTC.

Here's a handy tool for figuring out [cron expressions](https://crontab.guru/#0_0_*_*_*).


{emphasize-lines="4-6"}
```yaml
name: First Scraper

on:
  workflow_dispatch:
  schedule:
  - cron: "0 0 * * *"
```

Next, we will add what we just learned and add job and runner details. 

{emphasize-lines="8-12"}
```yaml
name: First Scraper

on:
  workflow_dispatch:
  schedule:
  - cron: "0 0 * * *"

jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    steps:
```

Think of Actions as renting a blank computer from GitHub. In order to use it, you will need to install latest version of whatever language you are using and corresponding package managers.

Because these Actions are used so often, GitHub has a [marketplace](https://github.com/marketplace?type=actions) where you can choose pre-packaged Action steps. 

The `Checkout` action checks-out our repository so your action file has access to it. We will use this so that we can add the scraped data back into the repo.

We will need to install Python, as our scraper is built in Python.

For scraper we will use [warn scraper](https://pypi.org/project/warn-scraper/) developed by folks at [Big Local News](https://biglocalnews.org/content/tools/layoff-watch.html).

{emphasize-lines="12-22"}
```yaml
name: First Scraper

on:
  workflow_dispatch:
  schedule:
  - cron: "0 0 * * *"

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
```

Now that the `warn-scraper` has been installed, we will need to run the scraper.

Per warn-scraper [documentation](https://warn-scraper.readthedocs.io/en/latest/usage.html), we know that to scrape, we simply type in `warn-scraper <state>`

Let's scrape Iowa, and add that scraped data into a `./data/` folder.

```yaml
      - name: Scrape
        run: warn-scraper IA --data-dir ./data/
```

Now that Action was able to grab the file and add it to a folder, we will need to commit this scrapped data back into our repo. 

{emphasize-lines="35-41"}
```yaml
name: First Scraper

on:
  workflow_dispatch:
  schedule:
  - cron: "0 0 * * *"

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
        run: warn-scraper IA --data-dir ./data/

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data for Iowa" && git push || true
```

Let's commit this workflow to our repo and run our Action! Go to `Actions` tab and choose your scraper workflow and click `Run workflow`

![first run](_static/scraper-3.png)


Once the Action has been completed, click inside of the Action. You will see that Action was unable to access the repository. This is because GitHub Actions requires that you provide [permissions](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#permissions).

![no-commit](_static/scraper-3a.png)

Let's go ahead an add the below line between on and jobs so that we provide write permissions to all jobs.

```yaml

permissions:
  contents: write

```

Your final file should look like this.

```yaml
name: First Scraper

on:
  workflow_dispatch:
  schedule:
  - cron: "0 0 * * *"

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
        run: warn-scraper IA --data-dir ./data/

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data for Iowa" && git push || true
```

Save the file and run the Action again.

Once the workflow has been completed, you should see that there are two new files committed to the `data` folder

![data folder](_static/scraper-4.png)

## Adding other enhancements

### Inputs

Github Actions will allow you to specify `inputs` for manually triggered workflows. This works great for us because now we can specify what states to scrape in our `warn-scraper` command.

To add an input option to your workflow, go to your yaml file and add the following lines. Here, we are asking Actions to create an `input` called `state` (there can be more than one inputs in a given Action).

If you need more control over your inputs, you can also add [choices](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#onworkflow_dispatchinputs).

{emphasize-lines="4-9"}
```yaml
name: First Scraper

on:
  workflow_dispatch:
    inputs:
      state:
        description: 'U.S. state to scrape'
        required: true
        default: 'ia'
  schedule:
  - cron: "0 0 * * *"
```

Once your input field has been configured, let's change our warn-scraper command so that whatever we input as `state` will reflect on the scrape command.

```yaml
      - name: Scrape
        run: warn-scraper ${{ inputs.state }} --data-dir ./data/
```

### Customize your commit message

You can add these inputs anywhere! Add them to your commit message for accuracy.

```yaml
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data for ${{ inputs.state }}" && git push || true
```
### Add a datestamp

Github may automatically [disable workflows](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow) if there's period of inactivity.
To get around this you can can have your workflow commit an updated text file every time your Action runs.

```yaml
      - name: Save datestamp
        run: echo "Scraped ${{ inputs.state }}" > ./data/latest-scrape.txt
```

## Final steps

Your final file should look like this.

```yaml
name: First Scraper

on:
  workflow_dispatch:
    inputs:
      state:
        description: 'U.S. state to scrape'
        required: true
        default: 'ia'
  schedule:
  - cron: "0 0 * * *"

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

Let's run the Action again. Now when you go to run your Action, you will see an input field. This will allow you to specify what which state to scrape for. Here I'm choosing CA.

![final action](_static/scraper-5.png)

Upon completion you will see that steps that reference `inputs.state` have been run with the correctly value. 

![final result](_static/scraper-6.png)

