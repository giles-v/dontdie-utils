import contentful from "contentful-management";
import path from "path";
import url from "url";

import { filenameToContentType, timeout } from "./utils";

const CM_API_KEY =
  "CFPAT-cc066bb865ba1607c8559da3855e0c9c0f30d41a6c98a55545a6c7dbdb31aee3";
const SPACE_ID = "qzgvnzdtse2f";
const CONTENT_TYPE_IDS = {
  author: "1kUEViTN4EmGiEaaeC6ouY",
  category: "5KMiN6YPvi42icqAUQMCQe",
  page: "page",
  post: "2wKn6yEnZewu2SCCkus4as"
};
let clientSpace;
let assetList;

/**
 * Memoized method for getting a Contentful client instance.
 */
const getClientSpace = async () => {
  if (!clientSpace) {
    clientSpace = await contentful
      .createClient({ accessToken: CM_API_KEY })
      .getSpace(SPACE_ID);
  }
  return clientSpace;
};

const getContentTypeName = item => {
  const keys = Object.keys(CONTENT_TYPE_IDS);
  const vals = Object.values(CONTENT_TYPE_IDS);
  return (
    keys[vals.indexOf(item.sys.contentType.sys.id)] ||
    "UNKNOWN CONTENT TYPE " + item.item.sys.contentType.sys.id
  );
};

const getMessageFromAPIError = err => JSON.parse(err.message).message;

/**
 * Converts a plain object of fields into a format containing language
 * codes for passing into Contentful.
 *
 * @param fields The object containing e.g. { title: 'foo', body: 'bar' }
 */
const formatFields = fields => {
  const fieldKeys = Object.keys(fields);
  const response = { fields: {} };
  fieldKeys.forEach(key => {
    response.fields[key] = { "en-US": fields[key] };
  });
  return response;
};

export const deleteAllEntries = async contentType => {
  const entries = await getAllEntries(contentType);
  console.log("Deleting", entries.length, "entries...");

  for (let entry of entries) {
    const identifier = getContentTypeName(entry) + " " + entry.sys.id;

    if (entry.isPublished()) {
      entry = await entry.unpublish();
    }

    await entry.delete();
    console.log("Deleted", identifier);
  }
};

export const getAllEntries = async contentType => {
  if (contentType) {
    console.log("Requesting all entries for content type", contentType);
  } else {
    console.log("Requesting all entries");
  }

  const search = contentType
    ? { content_type: CONTENT_TYPE_IDS[contentType] }
    : {};
  const space = await getClientSpace();
  const entries = await space.getEntries(search);

  return entries.items;
};

export const getAuthorWithName = async name => {
  const space = await getClientSpace();
  const entries = await space.getEntries({
    content_type: CONTENT_TYPE_IDS["author"],
    "fields.name": name
  });
  return entries.items.length ? entries.items[0] : null;
};

export const getAllAssets = async () => {
  console.log("Requesting all assets...");
  const space = await getClientSpace();
  const assets = await space.getAssets();
  return assets.items;
};

export const deleteAllAssets = async () => {
  if (!assetList) {
    assetList = await getAllAssets();
  }

  for (let asset of assetList) {
    const name = asset.fields.file["en-US"].fileName;

    if (asset.isPublished()) {
      asset = await asset.unpublish();
    }

    await asset.delete();
    console.log("Deleted asset", name);
  }
};

export const getOrUploadAsset = async fileUri => {
  console.log("Resolving asset", fileUri);
  const urlObj = url.parse(fileUri);
  const filename = path.basename(urlObj.pathname);

  if (!assetList) {
    assetList = await getAllAssets();
  }

  let existingAsset;
  assetList.forEach(item => {
    if (item.fields.file["en-US"].fileName === filename) {
      existingAsset = item;
    }
  });

  if (existingAsset) {
    console.log("Resolved to existing asset", item.sys.id);
    return existingAsset;
  }

  console.log("Uploading as new asset...");
  const space = await getClientSpace();
  const asset = await space.createAsset({
    fields: {
      title: {
        "en-US": filename
      },
      file: {
        "en-US": {
          contentType: filenameToContentType(filename),
          fileName: filename,
          upload: fileUri
        }
      }
    }
  });
  console.log("Processing asset...");
  const processedAsset = await asset.processForAllLocales();
  // await timeout(15000);
  console.log("Publishing asset...");
  const newAsset = await processedAsset.publish();
  console.log("Uploaded and published asset", newAsset.sys.id);
  return newAsset;
};

/**
 * Create a single author in Contentful.
 *
 * @param data object of post data.
 * @returns promise resolving to the author ID.
 */
export const createAuthor = ({ name, email, bio, image }) => {
  const fields = {
    name,
    email,
    biography: bio
  };

  if (image) {
    fields.profilePhoto = getOrUploadAsset(image);
  }

  return getClientSpace()
    .then(space =>
      space.createEntry(CONTENT_TYPE_IDS.author, formatFields(fields))
    )
    .then(entry => entry.publish());
};

/**
 * Create a single post in Contentful.
 *
 * @param data object of post data.
 */
export const createPost = async (post, author, tags) => {
  const { title, slug, body } = post;

  const space = await getClientSpace();

  const contentType = CONTENT_TYPE_IDS.post;
  const data = formatFields({ title, slug, body, tags });

  data.fields.author = {
    "en-US": [
      {
        sys: {
          type: "Link",
          linkType: "Entry",
          id: author.sys.id
        }
      }
    ]
  };

  let entry = await space.createEntry(contentType, data);

  entry = await entry.publish();
  return entry;
};