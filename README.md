# docx-ts

[![NPM version][npm-image]][npm-url]

> **- [FIRST VERSION] -** _Be indulgent and curious!_

Convert HTML document to docx format with header and footer.

## Installing

```
npm install docx-ts
```

## Usage

Support Browser environment, including nextjs/vue/react/angular.

### Example:

Here's an example of how to use the :

#### Simple without header or footer :

```js
import { asBlob } from "html-docx-ts";
import { saveAs } from "file-saver"; //save the file

const exportDocx = () => {
  //You can add style to element you want, the body manages it completely.
  const htmlSource = `
  <div>
    <h1> H1 in the docx html </h1>
    <p> Test docx html </p>
  </div>
  `;
  const options = { orientation: "portrait", margins: {} };

  asBlob({
    htmlSource: htmlSource,
    options: options
  }).then((blob) => {
    saveAs(blob as Blob, "Name of the docx");
  })

};
```

#### Exemple with header or footer :

```js
import { asBlob } from "html-docx-ts";
import { saveAs } from "file-saver"; //save the file

const exportDocx = () => {
  //You can add style to element you want, the body manages it completely.
  const htmlSource = `
  <div>
    <h1> H1 in the docx html </h1>
    <p> Test docx html </p>
  </div>
  `;

  const options = { orientation: "portrait", margins: {} };

  //For the header and footer, you need to start with a <p> tag. The parser will have an easier time knowing how to parse
  const  headerSource: {
    leftSideSource: "<p>LeftSide</p>",
    centerSource: "<p>CenterSide</p>",
    rightSideSource: "<p><img src='base64 src' alt='image alt' /></p>",
  };

  const footerSource: {
    leftSideSource: "<p>Page</p>",
    centerSource: "<p>{PAGE_NUM}</p>",
    rightSideSource: "<p>{PAGE_NUM}/{TOTAL_PAGES}</p>",
  };

  asBlob({
    htmlSource: htmlSource,
    options: options,
    headerSource : headerSource,
    footerSource: footerSource,
  }).then((blob) => {
    saveAs(blob as Blob, "docName");
  })

};
```

**How to have page numbering :** :
The library takes page numbering into account. For simple numbering, you can use {PAGE_NUM}, otherwise you can write {PAGE_NUM}/{TOTAL_PAGES} to get the numbering with the total of pages.

## Collaboration

Don't hesitate to collaborate on the project! I created it for my end-of-study internship, and I'm glad the lib can help. So don't hesitate to be curious!

Peace ✌️

## License

MIT

## Thanks to

[html-docx-js](https://www.npmjs.com/package/html-docx-js)
[html-docx-ts](https://www.npmjs.com/package/html-docx-ts)

[npm-image]: https://img.shields.io/npm/v/docx-ts?color=%23E6F0FD
[npm-url]: https://www.npmjs.com/package/docx-ts
