export type headerXmlRelsProps = {
  id: string;
  target: string;
}[];

export const headerXmlRels = (props: headerXmlRelsProps) => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${props
  .map(
    (prop) => `<Relationship Id="${prop.id}"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
    Target="media/${prop.target}" />`,
  )
  .join("\n")}
</Relationships>`;
};
