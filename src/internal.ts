import JSZip from 'jszip'
import { isBrowser } from 'browser-or-node'

import { documentTemplate, Orient, Margins, defaultMargins } from './templates'
import { contentTypesXml, documentXmlRels, relsXml } from './assets'
import { getFooter, getHeader, getMHTdocument } from './utils'

const defaultDocumentOptions = {
  orientation: 'portrait' as Orient,
  margins: {} as Margins,
}
export type DocumentOptions = typeof defaultDocumentOptions

function mergeOptions<T>(defaults: T, options: Partial<T>): T {
  return { ...defaults, ...options } as T
}

function getBinaryData(str: string) {
  return isBrowser ? new Blob([str]) : Buffer.from(str)
}

function renderDocumentFile(documentOptions: DocumentOptions) {
  const { orientation, margins } = documentOptions
  const marginsOptions = mergeOptions(defaultMargins, margins)
  let width = 0
  let height = 0
  if (orientation === 'landscape') {
    height = 11906
    width = 16838
  } else {
    width = 11906
    height = 16838
  }
  return documentTemplate(width, height, orientation, marginsOptions)
}

export function addFiles(
  zip: JSZip,
  htmlSource: string,
  options: Partial<DocumentOptions>,
  headerSource: string,
  footerSource: string,
) {
  const documentOptions = mergeOptions(defaultDocumentOptions, options)
  zip.file('[Content_Types].xml', getBinaryData(contentTypesXml))
  zip.folder('_rels')?.file('.rels', getBinaryData(relsXml))
  zip
    .folder('word')
    ?.file('document.xml', renderDocumentFile(documentOptions))
    ?.file('afchunk.mht', getMHTdocument(htmlSource))
    ?.file('header1.xml', getHeader(headerSource, zip))
    ?.file('footer1.xml', getFooter(footerSource, zip))
    .folder('_rels')
    ?.file('document.xml.rels', getBinaryData(documentXmlRels))
}

export async function generateDocument(zip: JSZip) {
  const buffer = await zip.generateAsync({ type: 'arraybuffer' })
  if (isBrowser) {
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  } else {
    return Buffer.from(new Uint8Array(buffer))
  }
}
