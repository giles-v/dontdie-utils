// e.g.: ![Insert](/path/to/image.jpg)
const RE_MARKDOWN_IMAGE = /\!\[([^\]]+)\]\(([^\)]+)\)/g;

export const resolveImage = url => url && "https://nodontdie.com" + url;

export const resolveMarkdownImages = markdown => {
  if (!RE_MARKDOWN_IMAGE.test(markdown)) {
    return markdown;
  }

  return markdown.replace(RE_MARKDOWN_IMAGE, (match, altText, imagePath) => {
    return `![${altText}](${resolveImage(imagePath)})`;
  });
};
