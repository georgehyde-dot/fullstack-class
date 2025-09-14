import { initDatabase } from './db/init.js'
import { Post } from './db/models/post.js'

import dotenv from 'dotenv'
dotenv.config()

await initDatabase()

const post = new Post({
  title: 'Hello second post!',
  author: 'George Hyde',
  contents: 'This post is a new post stored in a MongoDB database using Mongoose.',
  tags: ['mongoose', 'mongodb'],
})

await post.save()

const createdPost = await post.save()

await Post.findByIdAndUpdate(createdPost._id, {
  $set: { title: 'Hello again, Mongoose!' },
})

const posts = await Post.find()
console.log(posts)
