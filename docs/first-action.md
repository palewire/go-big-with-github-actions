# Your first Action

Iris will write this chapter, which will show how to make your first action and run it by clicking the workflow_dispatch button.

**Outline draft**

* Configure and run a simple starter Action that doesn’t do much
* Intentionally have bad YAML and force us to debug it

It will build up to something like this:

```yaml
name: First Action

on:
  workflow_dispatch:

jobs:
  scrape:
    name: Scrape
    runs-on: ubuntu-latest
    steps:
      - name: Hello world
        run: echo "Hello world"
```