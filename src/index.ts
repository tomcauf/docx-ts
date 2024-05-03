import {
  addFiles,
  generateDocument,
  DocumentOptions,
  HeaderFooterProps,
} from "./internal";
import JSZip from "jszip";

type asBlobProps = {
  htmlSource: string;
  options?: Partial<DocumentOptions>;
  headerSource?: HeaderFooterProps;
  footerSource?: HeaderFooterProps;
};

export async function asBlob({
  htmlSource,
  options,
  headerSource,
  footerSource,
}: asBlobProps) {
  const zip = new JSZip();
  addFiles({
    zip,
    htmlSource,
    options: options || {},
    headerSource,
    footerSource,
  });
  return await generateDocument(zip);
}
