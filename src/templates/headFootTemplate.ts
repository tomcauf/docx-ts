import { isBrowser } from 'browser-or-node'
function htmlToOpenXml(html: string, imageRels: Map<string, string>) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')

  let xmlString = ''
  console.log('DOC: ', doc)
  doc.querySelectorAll('p').forEach((p) => {
    xmlString += '<w:p>'
    p.childNodes.forEach((node) => {
      console.log('NODE: ', node)
      if (node.nodeType === Node.TEXT_NODE) {
        console.log('TEXT')
        xmlString += `<w:r><w:t>${node.textContent}</w:t></w:r>`
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        console.log('ELEMENT')
        const element = node as HTMLElement
        console.log('ELEMENT: ', element)
        switch (element.tagName.toLowerCase()) {
          case 'strong':
            console.log('STRONG')
            xmlString += `<w:r><w:rPr><w:b/></w:rPr><w:t>${element.textContent}</w:t></w:r>`
            break
          case 'img':
            console.log('IMG')
            const src = element.getAttribute('src')
            if (!src) break

            const rId = imageRels.get(src)
            if (!rId) break
            console.log(src)
            console.log(rId)
            const wImage: number = parseInt(element.getAttribute('width') || '142', 10) * 9525
            const hImage: number = parseInt(element.getAttribute('height') || '57', 10) * 9525
            xmlString += `
              <w:r>
                <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="${wImage}" cy="${hImage}" noChangeAspect="1"/>
                <wp:effectExtent l="0" t="0" r="0" b="0"/>
                <wp:docPr id="1" name="Picture 1" descr="Description"/>
                <wp:cNvGraphicFramePr>
                  <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                </wp:cNvGraphicFramePr>
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
                            <a:ext cx="1905000" cy="1905000"/>
                          </a:xfrm>
                          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                        </pic:spPr>
                      </pic:pic>
                    </a:graphicData>
                  </a:graphic>
                </wp:inline>
                </w:drawing>
              </w:r>`
            break
          default:
            console.log('DEFAULT:', element.tagName.toLowerCase())
            xmlString += `<w:r><w:t>${element.textContent}</w:t></w:r>`
            break
        }
      }
    })
    xmlString += '</w:p>'
  })

  return xmlString
}

export const headerTemplate = (htmlSource: string, imageRels: Map<string, string>) => {
  console.log(htmlSource)
  console.log(imageRels)
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
       xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      ${htmlToOpenXml(htmlSource, imageRels)}
  </w:hdr>`
}

export const footerTemplate = (htmlSource: string, imageRels: Map<string, string>) => {
  console.log(htmlSource)
  console.log(imageRels)
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
       xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      ${htmlToOpenXml(htmlSource, imageRels)}
  </w:ftr>`
}
