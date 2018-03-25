import {
  createAuthor,
  createPost,
  deleteAllAssets,
  deleteAllEntries,
  getAllAssets,
  getAllEntries,
  getAuthorWithName,
  getOrUploadAsset
} from "./contentful";
import {
  getTags,
  getUsers,
  getPostsTags,
  getPosts,
  getPages
} from "./extract-data";
import { requireJSON } from "./utils";

const importUsers = async users => {
  for (let user of users) {
    console.log("  Adding author", user.name);
    try {
      const defaultAvatar = await getOrUploadAsset(
        "https://nodontdie.com/content/images/2017/11/DontDieWhite.png"
      );
      await createAuthor(user, defaultAvatar);
    } catch (e) {
      console.log("  Failed to create author", user.name, e.message);
    }
  }
};

const getAuthorByGhostId = async (users, id) => {
  const user = users.filter(user => user.id === id).pop();
  return await getAuthorWithName(user.name);
};

const getTagArray = (post_id, tags, posts_tags) => {
  const tag_ids = posts_tags
    .filter(posts_tag => posts_tag.post_id === post_id)
    .map(posts_tag => posts_tag.tag_id);

  const tag_names = tags
    .filter(tag => tag_ids.includes(tag.id))
    .map(tag => tag.name.replace(",", ""));

  return tag_names;
};

const importPosts = async (posts, users, tags, posts_tags) => {
  for (let post of posts) {
    try {
      const author = await getAuthorByGhostId(users, post.author_id);
      const tagArray = await getTagArray(post.id, tags, posts_tags);
      const featuredImageAsset = await getOrUploadAsset(post.image);

      /**
       * To fix:
       * SEO meta
       * Inline images
       */

      await createPost(post, author, tagArray, featuredImageAsset);
      console.log("  Created post", post.title);
    } catch (e) {
      console.log("  Failed to create post", post.title, e.message);
    }
    return;
  }
};

async function run() {
  const data = requireJSON("./dont-die.ghost.2018-02-12.json").db[0].data;

  const posts_tags = getPostsTags(data);
  const users = getUsers(data);
  const tags = getTags(data);
  const pages = getPages(data);
  const posts = getPosts(data);

  console.log(`Retrieved data from Ghost.
    Users: ${users.length}
    Tags: ${tags.length}
    Posts: ${posts.length}
    Pages: ${pages.length}

Starting import to Contentful...`);
  console.log("");

  console.log("Deleting existing entries and assets...");
  await deleteAllEntries("post");

  // console.log("");
  // console.log("Creating authors...");
  // await importUsers(users);

  console.log("");
  console.log("Creating posts...");
  await importPosts(posts, users, tags, posts_tags);
}

run();
