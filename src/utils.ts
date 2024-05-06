import JSZip from "jszip";

import {
  footerTemplate,
  headerTemplate,
  mhtDocumentTemplate,
  mhtPartTemplate,
} from "./templates";
import {
  footerXmlRels,
  footerXmlRelsProps,
  headerXmlRels,
  headerXmlRelsProps,
} from "./assets";
import { HeaderFooterProps } from "./internal";
let currentId = 1;

export function getMHTdocument(htmlSource: string) {
  const ref = _prepareImageParts(htmlSource);
  const imageContentPartsString = ref.imageContentParts.join("\n");
  htmlSource = ref.htmlSource.replace(/\=/g, "=3D");
  return mhtDocumentTemplate(htmlSource, imageContentPartsString);
}

export function getHeader({
  headerSource,
  zip,
}: {
  headerSource?: HeaderFooterProps;
  zip: JSZip;
}) {
  const refLeft = _prepareImagePartsXML(
    headerSource?.leftSideSource || "",
    zip,
    currentId,
  );
  currentId = refLeft.currentId;
  const refCenter = _prepareImagePartsXML(
    headerSource?.centerSource || "",
    zip,
    currentId,
  );
  currentId = refCenter.currentId;
  const refRight = _prepareImagePartsXML(
    headerSource?.rightSideSource || "",
    zip,
    currentId,
  );
  currentId = refRight.currentId;
  const rels: headerXmlRelsProps = [];
  const imageRels = new Map();
  refLeft.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value });
    imageRels.set(value, key);
  });
  refCenter.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value });
    imageRels.set(value, key);
  });
  refRight.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value });
    imageRels.set(value, key);
  });

  zip.file("word/_rels/header1.xml.rels", headerXmlRels(rels));
  return headerTemplate({
    headerSource: {
      leftSideSource: refLeft.htmlSource,
      centerSource: refCenter.htmlSource,
      rightSideSource: refRight.htmlSource,
    },
    imageRels,
  });
}

export function getFooter({
  footerSource,
  zip,
}: {
  footerSource?: HeaderFooterProps;
  zip: JSZip;
}) {
  const refLeft = _prepareImagePartsXML(
    footerSource?.leftSideSource || "",
    zip,
    currentId,
  );
  currentId = refLeft.currentId;
  const refCenter = _prepareImagePartsXML(
    footerSource?.centerSource || "",
    zip,
    currentId,
  );
  currentId = refCenter.currentId;
  const refRight = _prepareImagePartsXML(
    footerSource?.rightSideSource || "",
    zip,
    currentId,
  );
  currentId = refRight.currentId;
  const rels: footerXmlRelsProps = [];
  const imageRels = new Map();
  refLeft.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value });
    imageRels.set(value, key);
  });
  refCenter.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value });
    imageRels.set(value, key);
  });
  refRight.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value });
    imageRels.set(value, key);
  });
  zip.file("word/_rels/footer1.xml.rels", footerXmlRels(rels));
  return footerTemplate({
    footerSource: {
      leftSideSource: refLeft.htmlSource,
      centerSource: refCenter.htmlSource,
      rightSideSource: refRight.htmlSource,
    },
    imageRels,
  });
}

function _prepareImageParts(htmlSource: string) {
  const imageContentParts: string[] = [];
  const inlinedSrcPattern = /"data:(\w+\/\w+);(\w+),(\S+)"/g;
  const inlinedReplacer = (
    match: string,
    contentType: string,
    contentEncoding: string,
    encodedContent: string,
  ) => {
    const index = imageContentParts.length;
    const extension = contentType.split("/")[1];
    const contentLocation = `file:///C:/fake/image${index}.${extension}`;
    imageContentParts.push(
      mhtPartTemplate(
        contentType,
        contentEncoding,
        contentLocation,
        encodedContent,
      ),
    );
    return `\"${contentLocation}\"`;
  };
  if (!/<img/g.test(htmlSource)) {
    return { htmlSource, imageContentParts };
  }
  htmlSource = htmlSource.replace(inlinedSrcPattern, inlinedReplacer);
  return { htmlSource, imageContentParts };
}

function _prepareImagePartsXML(
  htmlSource: string,
  zip: JSZip,
  currentId: number,
) {
  const imageRels: Map<string, string> = new Map();
  const inlinedSrcPattern = /"data:(\w+\/\w+);(\w+),(\S+)"/g;
  let matchIndex = currentId;

  const inlinedReplacer = (
    match: string,
    contentType: string,
    contentEncoding: string,
    encodedContent: string,
  ) => {
    const extension = contentType.split("/")[1];
    const contentLocation = `image${matchIndex}.${extension}`;

    const content = Buffer.from(
      encodedContent,
      contentEncoding as BufferEncoding,
    );
    zip.file(`word/media/image${matchIndex}.${extension}`, content);

    const rId = `rId${matchIndex++}`;
    imageRels.set(contentLocation, rId);
    return `\"${contentLocation}\"`;
  };

  htmlSource = htmlSource.replace(inlinedSrcPattern, inlinedReplacer);

  return { htmlSource, imageRels, currentId: matchIndex };
}
