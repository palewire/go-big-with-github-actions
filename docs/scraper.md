# Actions scrapers

This chapter will show you how to utilize GitHub Actions to

1. Install an existing WARN scraper from PyPI to run and `commit` results to your repo.
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


{emphasize-lines="4-5"}
```yaml
name: First Scraper

on:
  workflow_dispatch:
  schedule:
  - cron: "0 0 * * *"
```

Next, we will add what we just learned and add job and runner details. 

{emphasize-lines="11-15"}
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
```

Think of Actions as renting a blank computer from GitHub. In order to use it, you will need to install latest version of whatever language you are using and corresponding package managers.

Becasue these actions are used often, GitHub has a [marketplace](https://github.com/marketplace?type=actions)where you can choose pre-packaged Action steps. 

The `Checkout` action checks-out our repository so your action file has access to it. We will use this so that we can add the scraped data back into the repo.

We will need to install Python, as our scraper is built in Python.

For scraper we will use [warn scraper](https://pypi.org/project/warn-scraper/) developed by folks at [Big Local News](https://biglocalnews.org/content/tools/layoff-watch.html).

{emphasize-lines="16-25"}
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
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install scraper
        run: pip install warn-scraper
```

Now that the `warn-scraper` has been installed, we will need to actually run the scraper.

Per warn-scraper [documentation](https://warn-scraper.readthedocs.io/en/latest/usage.html), we know that the function is as simple as `warn-scraper <state>`

Let's scrape Iowa. We can see here that the scraped data will be saved to `./data/` folder.

```yaml
      - name: Scrape
        run: warn-scraper IA --data-dir ./data/
```

Since we using a machine that's not our own, we will need to commit this scrapped data back into our repo. 

{emphasize-lines="30-40"}
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

      - name: Save datestamp
        run: date > ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data for Iowa" && git push || true
```

Let's commit this workflow to our repo and run our Actions!



## Final workflow file

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