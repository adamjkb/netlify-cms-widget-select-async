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
> You may install it through native JavaScript `import` through CDNs such as [Skypack](https://www.skypack.dev/)
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
Add to your [NetlifyCMS collection](https://www.netlifycms.org/docs/configuration-options/#collections):
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
Add to your [NetlifyCMS collection](https://www.netlifycms.org/docs/configuration-options/#collections):
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
    grouped_options:
        data_path: node.options.edges
        value_field: node.id
        display_field: node.title
    multiple: true
    min: 1
    max: 4
    refetch_url: false
    fetch_options:
        headers:
            Content-Type: application/json
            X-Shopify-Storefront-Access-Token: dd4d4dc146542ba7763305d71d1b3d38
        method: POST
        body: '{"query": "query allProducts{ products(first:10) { edges { node { label: title value: id options: variants(first:3) { edges { node { id title } } } } } } }"}'

```
## Options
### `url` _string_ <a name="url"></a>

Endpoint URL

_Example: https://fakestoreapi.com/products_

<br/>

### `display_field` _string | default: "label"_ <a name="display_field"></a>

Object key or path to object to be displayed.

_Example: `node.label` or `title`_

<br/>

### `value_field` _string | default: "value"_ <a name="value_field"></a>

Object key or path to object to be saved.

_Example: `node.value` or `id`_

<br/>

### `data_path` _string?_ <a name="data_path"></a>

Object key or path to object to the array of objects to be used as options.

If `fetch()` request does not return an array of object but an object this value can be used to access the array.

_Example: `data.products.edges` or `data`_

<br/>

### `multiple` _boolean | default: false_ <a name="multiple"></a>

Allows multiple options to be selected. Widget's output value is going to change to an `string[]`

<br/>

### `min` and `max` _integer?_ <a name="min"></a><a name="max"></a>

Minimum and maximum number of items allowed to be selected
> ignored if [`multiple`](#multiple) is false

<br/>

### `refetch_url` _boolean | default: true_ <a name="refetch_url"></a>

By default `react-select` will send a try to load new options through a new request whenever the search input changes, setting this field's value to `false` will prevent that and retain the options after the initial request.

> Note that the fetched options are filtered with fuzzy search so the search input will affect the displayed options.

<br/>

### `fetch_options` _object?_ <a name="fetch_options"></a>

The properties of this field are mapping to the main values of native `fetch()` request parameters. [`fetch()` documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#syntax)

> If you need to set parameters outside of the built-in `method`,`headers`, and `body` you can do so with by extending the passed in parameters using the [`fethc_options.params_function`](#fetch_options__params_function)


##### `fetch_options.method` _string | default: "GET"_ <a name="fetch_options__get"></a>

Request method.


##### `fetch_options.headers` _object | default: {}_ <a name="fetch_options__headers"></a>

Request headers.

_Example:_

```yml
fetch_options:
    headers:
        Content-Type: application/json
        X-Access-Token: <PUBLIC-API-KEY>
```


##### `fetch_options.body` _string | default: undefined_ <a name="fetch_options__body"></a>

Request body.

_Note that GET methods does not have a body. [Change request method](#fetch_options__method) if you are specifying this field._

##### `fetch_options.params_function` _function?_ <a name="fetch_options__params_function"></a>

> ⚠️ Only works if you are using a JavaScript config file to initialize NetlifyCMS. Refer to [documentation](https://www.netlifycms.org/docs/beta-features/#manual-initialization) how to set that up.

A JavaScript function that receives all all the other `fetch_options` values, the `url`, and the search input term. Must return a valid object with at least a url property.

```js
function({term, url, method, headers, body}) {
    // ...
    return {
        url, // required
        options: {method, headers, body} // optional
    }
}
```

<details>
<summary>Example config using a GraphQL query with variables:</summary>

```js
fetch_options: {
    // ...
    params_function: ({ term, url, ...rest }) => ({
        url,
        options: {
            ...rest,
            body: JSON.stringify({
                query: `
                    query allProducts(
                        $myCustomQuery: String
                    ) {
                        products(
                            first: 15
                            query: $myCustomQuery
                        ) {
                            edges {
                                node {
                                    label: title
                                    value: id
                                }
                            }
                        }
                    }
                `,
                variables: {
                    'myCustomQuery': `title:${term}*`
                }
            })
        }
    })    
}

```
</details>


## Authors

- [@adamjkb](https://github.com/adamjkb)

## Acknowledgments
The project was heavily inspired by [@chrisboustead](https://github.com/chrisboustead)'s asynchronous implementation of the original NetlifyCMS Select widget, [`netlify-cms-widget-select-async`](https://github.com/chrisboustead/netlify-cms-widget-async-select)
