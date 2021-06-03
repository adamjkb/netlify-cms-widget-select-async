---

<p align="center">⚠️ Pre-release version, under development</p>

---

# Async Select Widget for NetlifyCMS

A select widget for [NetlifyCMS](https://www.netlifycms.org/) widget that allows you to select a string value or an array of strings. The options are populated through asynchronous fetch requests.

`TODO: 'Checkout the demo' link`

`TODO: Add screenshot`

## Table of contents
 * [Features](#features)
 * [Install](#install)
     - [Via NPM](#via-npm)
     - [Via `script` tag](#via-script-tag)
 * [How to use](#how-to-use)
     - [Simple usage](#simple-usage)
     - [Advanced usage](#advanced-usage)
 * [Options](#options)
 * [Authors](#authors)
 * [Acknowledgments](#acknowledgments)


## Features
- Support for custom `fetch()` request parameters like headers, method, and body
- Supports GraphQL and REST APIs
- Nested data structures
- Grouped options
- Fuzzy searching fetched options

## Install
#### Via NPM:
```bash
npm install @adamjkb/netlify-cms-widget-async
```
> You may install it through native Javascript `import` through CDNs such as [Skypack](https://www.skypack.dev/)
```js
import { Widget as AsyncSelectWidget } from '@adamjkb/netlify-cms-widget-async'
CMS.registerWidget(AsyncSelectWidget)
```


#### Via `script` tag:
```js
<script src='https://unpkg.com/@adamjkb/netlify-cms-widget-select-async/dist/index.umd.js'></script>
<script>
    CMS.registerWidget(AsyncSelectWidget.Widget)
</script>
```

## How to use


### Simple usage
Add to your NetlifyCMS collection:
```yml
fields:
  - name: simple_usage
    label: Simple usage
    widget: select-async
    # widget options:
    url: https://fakestoreapi.com/products
    value_field: id
    display_field: title

```
### Advanced usage
Add to your NetlifyCMS collection:
```yml
fields:
  - name: advanced_usage
    label: Advanced usage
    widget: select-async
    # widget options:
    url: https://graphql.myshopify.com/api/graphql
    value_field: node.value
    display_field: node.label
    data_path: data.products.edges
    multiple: true
    grouped_options:
        data_path: node.options.edges
        value_field: node.id
        display_field: node.title
    fetch_options:
        headers:
            Content-Type: application/json
            X-Shopify-Storefront-Access-Token: dd4d4dc146542ba7763305d71d1b3d38
        method: POST
        body: '{"query": "query allProducts{ products(first:10) { edges { node { label: title value: id options: variants(first:3) { edges { node { id title } } } } } } }"}'

```
## Options
#### `url` _string_

Endpoint URL

_Example: https://fakestoreapi.com/products_

<br/>

#### `display_field` _string | default: "label"_

Object key or path to object to be displayed.

_Example: `node.label` or `title`_

<br/>

#### `value_field` _string | default: "value"_

Object key or path to object to be saved.

_Example: `node.value` or `id`_

<br/>

#### `data_path` _string?_

Object key or path to object to the array of objects to be used as options.

If `fetch()` request does not return an array of object but an object this value can be used to access the array.

_Example: `data.products.edges` or `data`_

<br/>

#### `multiple` _boolean | default: false_

Allows multiple options to be selected. Widget's output value is going to change to an `string[]`

<br/>

#### `min` and `max` _integer?_

minimum and maximum number of items allowed to be selected
> ignored if [`multiple`](#multiple) is false

<br/>

#### `refetch_url` _boolean | default: true_

By default `react-select` will send a try to load new options through a new request whenever the search input changes, setting this field's value to `false` will prevent that and retain the options after the initial request.

> Note that the fetched options are filtered with fuzzy search so the search input will affect the displayed options.

## Authors

- [@adamjkb](https://github.com/adamjkb)

## Acknowledgments
The project was heavily inspired by [@chrisboustead](https://github.com/chrisboustead)'s asynchronous implementation of the original NetlifyCMS Select widget, [`netlify-cms-widget-select-async`](https://github.com/chrisboustead/netlify-cms-widget-async-select)
