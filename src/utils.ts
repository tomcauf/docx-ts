import JSZip from 'jszip'

import { footerTemplate, headerTemplate, mhtDocumentTemplate, mhtPartTemplate } from './templates'
import { footerXmlRels, footerXmlRelsProps, headerXmlRels, headerXmlRelsProps } from './assets'

export function getMHTdocument(htmlSource: string) {
  console.log(htmlSource)
  const ref = _prepareImageParts(htmlSource)
  const imageContentPartsString = ref.imageContentParts.join('\n')
  console.log(ref.htmlSource)
  htmlSource = ref.htmlSource.replace(/\=/g, '=3D')
  return mhtDocumentTemplate(htmlSource, imageContentPartsString)
}

export function getHeader(htmlSource: string, zip: JSZip) {
  const ref = _prepareImagePartsXML(htmlSource, zip)
  const rels: headerXmlRelsProps = []
  ref.imageRels.forEach((key, value) => {
    rels.push({ id: key, target: value })
  })

  zip.file('word/_rels/header1.xml.rels', headerXmlRels(rels))
  return headerTemplate(ref.htmlSource, ref.imageRels)
}

export function getFooter(htmlSource: string, zip: JSZip) {
  const ref = _prepareImagePartsXML(htmlSource, zip)
  const rels: footerXmlRelsProps = []
  ref.imageRels.forEach((key, value) => {
    rels.push({ id: value, target: key })
  })
  zip.file('word/_rels/footer1.xml.rels', footerXmlRels(rels))
  return footerTemplate(ref.htmlSource, ref.imageRels)
}

function _prepareImageParts(htmlSource: string) {
  const imageContentParts: string[] = []
  const inlinedSrcPattern = /"data:(\w+\/\w+);(\w+),(\S+)"/g
  const inlinedReplacer = (match: string, contentType: string, contentEncoding: string, encodedContent: string) => {
    const index = imageContentParts.length
    const extension = contentType.split('/')[1]
    const contentLocation = `file:///C:/fake/image${index}.${extension}`
    imageContentParts.push(mhtPartTemplate(contentType, contentEncoding, contentLocation, encodedContent))
    return `\"${contentLocation}\"`
  }
  if (!/<img/g.test(htmlSource)) {
    return { htmlSource, imageContentParts }
  }
  htmlSource = htmlSource.replace(inlinedSrcPattern, inlinedReplacer)
  return { htmlSource, imageContentParts }
}

function _prepareImagePartsXML(htmlSource: string, zip: JSZip) {
  const imageRels: Map<string, string> = new Map()
  const inlinedSrcPattern = /"data:(\w+\/\w+);(\w+),(\S+)"/g
  let matchIndex = 1

  const inlinedReplacer = (match: string, contentType: string, contentEncoding: string, encodedContent: string) => {
    const extension = contentType.split('/')[1]
    const contentLocation = `image${matchIndex}.${extension}`

    const content = Buffer.from(encodedContent, contentEncoding as BufferEncoding)
    zip.file(`word/media/image${matchIndex}.${extension}`, content)

    const rId = `rId${matchIndex++}`
    imageRels.set(contentLocation, rId)
    return `\"${contentLocation}\"`
  }

  htmlSource = htmlSource.replace(inlinedSrcPattern, inlinedReplacer)

  return { htmlSource, imageRels }
}
