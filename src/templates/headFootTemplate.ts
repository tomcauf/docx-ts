import { HeaderFooterProps } from "../internal";

function pageNumbersTemplate(pageNum: string) {
  if (pageNum === "{PAGE_NUM}") {
    return `<w:r><w:fldChar w:fldCharType="begin" /></w:r>
    <w:r>
      <w:instrText>PAGE \* MERGEFORMAT</w:instrText>
    </w:r>
    <w:r><w:fldChar w:fldCharType="end" /></w:r>`;
  } else if (pageNum === "{PAGE_NUM}/{TOTAL_PAGES}") {
    return `
      <w:r><w:fldChar w:fldCharType="begin" /></w:r>
      <w:r>
        <w:instrText>PAGE \* MERGEFORMAT</w:instrText>
      </w:r>
      <w:r><w:fldChar w:fldCharType="end" /></w:r>
      <w:r><w:t>/</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="begin" /></w:r>
      <w:r>
        <w:instrText>NUMPAGES \* MERGEFORMAT</w:instrText>
      </w:r>
      <w:r><w:fldChar w:fldCharType="end" /></w:r>
    `;
  } else {
    return "";
  }
}

function htmlToOpenXml({
  htmlSource,
  imageRels,
}: {
  htmlSource?: string;
  imageRels: Map<string, string>;
}) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlSource}</div>`, "text/html");

  let xmlString = "";
  doc.querySelectorAll("p").forEach((p) => {
    xmlString += "<w:p>";
    p.childNodes.forEach((node) => {
      xmlString += xmlElement(node, imageRels);
    });
    xmlString += "</w:p>";
  });

  return xmlString;
}

function xmlElement(node: Node, imageRels: Map<string, string>) {
  let xmlString = "";
  if (node.nodeType === Node.TEXT_NODE) {
    xmlString += `<w:r><w:t>${node.textContent}</w:t></w:r>`;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    switch (element.tagName.toLowerCase()) {
      case "strong":
        xmlString += getStrongText(element.textContent || "");
        break;
      case "img":
        xmlString += getImageElement(element, imageRels);
        break;
      default:
        if (
          element.textContent === "{PAGE_NUM}" ||
          element.textContent === "{PAGE_NUM}/{TOTAL_PAGES}"
        ) {
          xmlString += pageNumbersTemplate(element.textContent);
        } else {
          xmlString += `<w:r><w:t>${element.textContent}</w:t></w:r>`;
        }
        break;
    }
  } else {
    console.log("[DOCX-TS] Unknow Node in your HEADER or FOOTER : ", node);
  }
  return xmlString;
}

function getStrongText(text: string) {
  return `<w:r><w:rPr><w:b/></w:rPr><w:t>${text}</w:t></w:r>`;
}

function getImageElement(element: HTMLElement, imageRels: Map<string, string>) {
  const src = element.getAttribute("src");
  if (!src) return "";
  const rId = imageRels.get(src);
  if (!rId) return "";
  const wImage: number =
    parseInt(element.getAttribute("width") || "142", 10) * 9525;
  const hImage: number =
    parseInt(element.getAttribute("height") || "57", 10) * 9525;
  return `
          <w:r>
            <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="${wImage}" cy="${hImage}" />
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="1" name="Picture 1" descr="Description"/>
            <wp:cNvGraphicFramePr />
              <a:graphic>
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic>
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="Picture 1"/>
                      <pic:cNvPicPr />
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="${rId}"/>
                      <a:stretch>
                        <a:fillRect/>
                      </a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${wImage}" cy="${hImage}"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
            </w:drawing>
          </w:r>`;
}

export const headerTemplate = ({
  headerSource,
  imageRels,
}: {
  headerSource?: HeaderFooterProps;
  imageRels: Map<string, string>;
}) => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
         xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
         xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
         xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblLook w:val="04A0"/>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1666" w:type="pct"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="left"/>
          </w:pPr>
          <w:r>
          ${htmlToOpenXml({ htmlSource: headerSource?.leftSideSource, imageRels })}
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1666" w:type="pct"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
          ${htmlToOpenXml({ htmlSource: headerSource?.centerSource, imageRels })}
          </w:r>
        </w:p>
      </w:tc>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="1666" w:type="pct"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:jc w:val="right"/>
          </w:pPr>
          <w:r>
          ${htmlToOpenXml({ htmlSource: headerSource?.rightSideSource, imageRels })}
          </w:r>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
  </w:hdr>  
  `;
};

export const footerTemplate = ({
  footerSource,
  imageRels,
}: {
  footerSource?: HeaderFooterProps;
  imageRels: Map<string, string>;
}) => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
       xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
       <w:tbl>
       <w:tblPr>
         <w:tblStyle w:val="TableGrid"/>
         <w:tblW w:w="5000" w:type="pct"/>
         <w:tblLook w:val="04A0"/>
       </w:tblPr>
       <w:tr>
         <w:tc>
           <w:tcPr>
             <w:tcW w:w="1666" w:type="pct"/>
           </w:tcPr>
           <w:p>
             <w:pPr>
               <w:jc w:val="left"/>
             </w:pPr>
             <w:r>
             ${htmlToOpenXml({ htmlSource: footerSource?.leftSideSource, imageRels })}
             </w:r>
           </w:p>
         </w:tc>
         <w:tc>
           <w:tcPr>
             <w:tcW w:w="1666" w:type="pct"/>
           </w:tcPr>
           <w:p>
             <w:pPr>
               <w:jc w:val="center"/>
             </w:pPr>
             <w:r>
             ${htmlToOpenXml({ htmlSource: footerSource?.centerSource, imageRels })}
             </w:r>
           </w:p>
         </w:tc>
         <w:tc>
           <w:tcPr>
             <w:tcW w:w="1666" w:type="pct"/>
           </w:tcPr>
           <w:p>
             <w:pPr>
               <w:jc w:val="right"/>
             </w:pPr>
             <w:r>
             ${htmlToOpenXml({ htmlSource: footerSource?.rightSideSource, imageRels })}
             </w:r>
           </w:p>
         </w:tc>
       </w:tr>
     </w:tbl>
  </w:ftr>`;
};
