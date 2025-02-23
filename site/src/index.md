# WARN notice database

Search the latest layoff notices

```js
// Read in the CSV file
const data = FileAttachment("data/ia.csv").csv({typed: true});
```

```js
// Create a search filter
const searchFilter = Inputs.search(data, {
    placeholder: "Search",
    format: d => "",
});

// Store the result of the filter
const searchInput = Generators.input(searchFilter);
```

```js
// Create a table from the filtered data
const table = Inputs.table(searchInput, { rows: 500 });
```

<div class="control-group">
<div class="control">
    ${searchFilter}
</div>
</div>

<div>
    ${view(table)}
</div>
