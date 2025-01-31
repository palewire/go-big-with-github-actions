# Iowa WARN notices

Search the latest layoff notices

```js
const url = "https://raw.githubusercontent.com/palewire/go-big-with-github-actions/refs/heads/main/data/ia.csv?token=GHSAT0AAAAAACU5S4R7GRBLGXUY2E7CBDEIZ45HRUA";
// Fetch
const data = await d3.csv(url);
console.log(data)
```

```js
const searchFilter = Inputs.search(data, {
    placeholder: "Search",
    columns: ["company"],
    format: d => "",
});

const searchInput = Generators.input(searchFilter);
```

```js
const table = Inputs.table(data, {
    rows: 500,
});
```


<div class="control-group">
<div class="control">
    ${searchFilter}
</div>
</div>

<div>
    ${view(table)}
</div>