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

Becasue these actions are used so often, GitHub has a [marketplace](https://github.com/marketplace?type=actions) where you can choose pre-packaged Action steps. 

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

Now that the `warn-scraper` has been installed, we will need to run the scraper.

Per warn-scraper [documentation](https://warn-scraper.readthedocs.io/en/latest/usage.html), we know that to scrape, we simply type in `warn-scraper <state>`

Let's scrape Iowa, and add that scraped data into a `./data/` folder.

```yaml
      - name: Scrape
        run: warn-scraper IA --data-dir ./data/
```

Since we using a machine that's not our own, we will need to commit this scrapped data back into our repo. 

{emphasize-lines="35-41"}
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

Let's commit this workflow to our repo and run our Actions!

IMAGE TK

## Adding other enhancements

### Inputs

Github Actions will allow you to specify `inputs` for manually triggered workflows. This works great for us because now we can specify what states to scrape in our `warn-scraper` command.

To add an input option to your workflow, go to your yaml file and add the following lines. Here, we are asking Actions to create an `input` called `state` (there can be more than one inputs in a given Action).

If you need more control over your inputs, you can also add [choices](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#onworkflow_dispatchinputs).

{emphasize-lines="4-8"}
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


### Enhance your timestamps

If you want to keep a detailed log on what is being scrapped, you can also use the state input to enahnce your latest-scrape file. Here we will integrate a state name and concatenate our timestamp.

```yaml
      - name: Save datestamp
        run: echo "Scraped ${{ inputs.state }} on $(date)" >> ./data/latest-scrape.txt
```



## Final workflow file

Let's make sure our inputs and timestamps are in. Your final file should look like this.

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
        run: echo "Scraped ${{ inputs.state }} on $(date)" >> ./data/latest-scrape.txt

      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@users.noreply.github.com"	
          git add ./data/
          git commit -m "Latest data for ${{ inputs.state }}" && git push || true
```

IMAGE TK


## Let's scrape everything!



- [LAT coronavirus scrapers](https://github.com/datadesk/california-coronavirus-scrapers)
- [USDA animal inspections](https://github.com/data-liberation-project/aphis-inspection-reports)
- [fed-dot-plot-scraper](https://github.com/palewire/fed-dot-plot-scraper)