![@fnando/router: Simple router for the browser.](https://github.com/fnando/router/raw/main/router.png)

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-orange.svg" alt="License: MIT">
  <img src="http://img.badgesize.io/fnando/router/master/dist/router.js.svg?label=min+size" alt="Minified size">
  <img src="http://img.badgesize.io/fnando/router/master/dist/router.js.svg?compression=gzip&label=min%2Bgzip+size" alt="Minified+gzip size">
</p>

## Instalation

This lib is available as a NPM package. To install it, use the following command:

```
npm install @fnando/router --save
```

If you're using Yarn (and you should):

```
yarn add @fnando/router
```

## Importing Router

If you're using `import`:

```js
import { router } from "@fnando/router";

router()
  .on("/", () => console.log("welcome home!"))
  .on("/posts/:slug", params => console.log(`viewing ${params.slug} post`))
  .on("/posts/archive/:year/:month", {year: /^\d{4}$/, month: value => value >= 1 && value <= 12}, params => console.log(`viewing archive for ${params.year}`))
  .on("/posts(/new)", () => console.log("/posts or /posts/new"))
  .fallback(() => console.log("no routes matched"))
  .run();
```

## API

- `router().on(path, conditions, callback)` adds a route that must be valid according to the `conditions`.
- `router().on(path, callback)` adds a route that must be valid according to the target path.
- `router().run(pathname = window.location.pathname)` returns the result of the matched url and the params. E.g. `const [result, params] = router().run()`. If you have added multiple fallbacks, then `result` will be an array. If only one fallback is defined, then you get the result instead.

## Icon

Icon made by [Freepik](https://www.freepik.com) from [Flaticon](https://www.flaticon.com/) is licensed by Creative Commons BY 3.0.

## License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
