import { getTags, getUsers, getPostsTags, getPosts, getPages } from './extract-data';
import { requireJSON } from './utils';

const data = requireJSON('./dont-die.ghost.2018-02-12.json').db[0].data;

const posts_tags = getPostsTags(data);
const users = getUsers(data);
const tags = getTags(data);
const pages = getPages(data);
const posts = getPosts(data);

console.log('How many users?', users.length);
console.log('How many tags?', tags.length);
console.log('How many posts?', posts.length);
console.log('How many pages?', pages.length);
