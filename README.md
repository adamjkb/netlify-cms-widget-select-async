---

<p align="center">⚠️ Pre-release version, under development</p>

---

# Async Select Widget for NetlifyCMS

A select widget for [NetlifyCMS](https://www.netlifycms.org/) widget that allows you to select a string value or an array of strings. The options are populated through asynchronous fetch requests.

`TODO: 'Checkout the demo' link`

`TODO: Add screenshot`

`TODO: Add Table of Contents`


## Features <a name="features"></a>
- Support for custom `fetch()` request parameters like headers, method, and body
- Supports GraphQL and REST APIs
- Nested data structures
- Grouped options
- Fuzzy searching fetched options

## Install <a name="install"></a>
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

## How to use <a name="how-to-use"></a>


### Simple usage <a name="simple-usage"></a>
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
### Advanced usage <a name="advanced-usage"></a>
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
## Options <a name="widget-options"></a>
`TODO`


## Authors <a name="authors"></a>

- [@adamjkb](https://github.com/adamjkb)

## Acknowledgments <a name="acknowledgments"></a>
The project was heavily inspired by [@chrisboustead](https://github.com/chrisboustead)'s asynchronous implementation of the original NetlifyCMS Select widget, [`netlify-cms-widget-select-async`](https://github.com/chrisboustead/netlify-cms-widget-async-select)
