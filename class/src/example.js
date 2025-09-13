import { initDatabase } from './db/init.js';
import { Post } from './db/models/post.js';

await initDatabase();
const post = new Post({
  title: 'Hello Mongoose',
  author: 'Loki Dog',
  contents: 'This post is stored in a MongoDB database using Mongoose.',
  tags: ['mongoose', 'mongodb'],
});

const createdPost = await post.save();

const Posts = await Post.find();
console.log(Posts);

await Post.findByIdAndUpdate(createdPost._id, {
  $set: { title: 'Hello Again, Loki!' },
});

console.log(Posts);
