# SqlOps Studio MSSQL Spatial Preview Extension

This SqlOps / Azure Datastudio plugin allows to review spatial results on an integrated map viewer.

## Development

If you want to build the extension, run:

```
npm run compile
```

If you want to publish the extension, run:

```
npm run publish
```
> Hint: This command executes `vsce package`. If you might need to run `npm install -g vsce` before.

## Features

* Parsing `geometry` datatype
* Parsing `geography` datatype
* Support multiple spatial columns per row

