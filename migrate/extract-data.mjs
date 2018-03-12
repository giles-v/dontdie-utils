import { resolveImage, resolveMarkdownImages } from './ghost-utils';

export const getPages = data => data.posts.filter(post => post.page).map(post => {
  const { id, title, slug, mobiledoc, html, feature_image, status, author_id } = post;
  return {
    id,
    title,
    slug,
    markdown: resolveMarkdownImages(mobiledoc),
    html,
    image: resolveImage(feature_image),
    status,
    author_id
  };
});

export const getPosts = data => data.posts.filter(post => !post.page).map(post => {
  const { id, title, slug, mobiledoc, html, feature_image, status, author_id } = post;
  return {
    id,
    title,
    slug,
    markdown: resolveMarkdownImages(mobiledoc),
    html,
    image: resolveImage(feature_image),
    status,
    author_id
  };
});

export const getPostsTags = data => data.posts_tags;

export const getTags = data => data.tags.map(tag => {
  const { id, name, slug } = tag;
  return {
    id,
    name,
    slug
  };
});

export const getUsers = data => data.users.map(user => {
  const { id, name, email, bio, profile_image } = user;
  return {
    id,
    name,
    email,
    bio,
    profile_image: resolveImage(profile_image)
  }
});
