import { addFiles, generateDocument, DocumentOptions } from './internal'
import JSZip from 'jszip'

type asBlobProps = {
  htmlSource: string
  options?: Partial<DocumentOptions>
  headerSource?: string
  footerSource?: string
}

export async function asBlob({ htmlSource, options, headerSource, footerSource }: asBlobProps) {
  const zip = new JSZip()
  addFiles(zip, htmlSource, options ?? {}, headerSource || '', footerSource || '')
  return await generateDocument(zip)
}
