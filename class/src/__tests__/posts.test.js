import mongoose from 'mongoose';
import { describe, expect, test, beforeEach } from '@jest/globals';

import {
  createPost,
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  getPostById,
  updatePost,
  deletePost,
} from '../services/post.js';
import { Post } from '../db/models/post.js';

describe('creating posts', () => {
  test('with all params, should succeed', async () => {
    const post = {
      title: 'Hello Loki!',
      author: 'Your Dog',
      contents: 'This post is stored in a MongoDB database using Mongoose.',
      tags: ['mongoose', 'mongodb'],
    };

    const createdPost = await createPost(post);

    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const foundPost = await Post.findById(createdPost._id);

    expect(foundPost).toEqual(expect.objectContaining(post));
    expect(foundPost.createdAt).toBeInstanceOf(Date);
    expect(foundPost.updatedAt).toBeInstanceOf(Date);
  });

  test('without titles, should faile', async () => {
    const post = {
      author: 'Your Dog',
      contents: 'This post is stored in a MongoDB database using Mongoose.',
      tags: ['mongoose', 'mongodb'],
    };

    try {
      await createPost(post);
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain('`title` is required');
    }
  });

  test('with minimal params, should succeed', async () => {
    const post = {
      title: 'Just Dog',
    };

    const createdPost = await createPost(post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});

const samplePosts = [
  {
    title: 'Crime and Punishment',
    author: 'Fiodor Dostoyevsky',
    tags: ['good'],
  },
  { title: 'Hyperion', author: 'Dan Simmons', tags: ['sci-fi'] },
  {
    title: 'Beowulf',
    author: 'Unknown',
    tags: ['translations', 'Tolkien', 'good'],
  },
  { title: 'Endurance' },
];

let createdSamplePosts = [];
beforeEach(async () => {
  await Post.deleteMany({});
  createdSamplePosts = [];
  for (const post of samplePosts) {
    const createdPost = new Post(post);
    createdSamplePosts.push(await createdPost.save());
  }
});

describe('listing posts', () => {
  test('should return all posts', async () => {
    const posts = await listAllPosts();
    expect(posts.length).toEqual(createdSamplePosts.length);
  });

  test('should return posts sorted by creation date descending by default', async () => {
    const posts = await listAllPosts();
    const sortedSamplePosts = createdSamplePosts.sort(
      (a, b) => b.createdAt - a.createdAt,
    );
    expect(posts.map((post) => post.createdAt)).toEqual(
      sortedSamplePosts.map((post) => post.createdAt),
    );
  });
  test('should take into account provided sorting options', async () => {
    const posts = await listAllPosts({
      sortBy: 'updatedAt',
      sortOrder: 'ascending',
    });
    const sortedSamplePosts = createdSamplePosts.sort(
      (a, b) => a.updatedAt - b.updatedAt,
    );
    expect(posts.map((post) => post.updatedAt)).toEqual(
      sortedSamplePosts.map((post) => post.updatedAt),
    );
  });

  test('should be able to filter posts by author', async () => {
    const posts = await listPostsByAuthor('Unknown');
    expect(posts.length).toBe(1);
  });

  test('should be able to filter posts by tag', async () => {
    const posts = await listPostsByTag('good');
    expect(posts.length).toBe(2);
  });
});

describe('getting a post', () => {
  test('should return full post', async () => {
    const post = await getPostById(createdSamplePosts[0]._id);
    expect(post.toObject()).toEqual(createdSamplePosts[0].toObject());
  });
  test('should fail if the id does not exist', async () => {
    const post = await getPostById('000000000000000000000000');
    expect(post).toEqual(null);
  });
});

describe('updating posts', () => {
  test('should update specified property', async () => {
    await updatePost(createdSamplePosts[0]._id, {
      author: 'New Author',
    });
    const updatedPost = await Post.findById(createdSamplePosts[0]._id);
    expect(updatedPost.author).toEqual('New Author');
  });
  test('should not update other properties', async () => {
    const originalTitle = await createdSamplePosts[0].title;
    await updatePost(createdSamplePosts[0]._id, {
      author: 'New Author',
    });
    const updatedPost = await Post.findById(createdSamplePosts[0]._id);
    expect(updatedPost.title).toEqual(originalTitle);
  });
  test('updatedAt should change with updates', async () => {
    await updatePost(createdSamplePosts[0]._id, {
      author: 'New Author',
    });
    const updatedPost = await Post.findById(createdSamplePosts[0]._id);
    expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(
      createdSamplePosts[0].updatedAt.getTime(),
    );
  });
  test('should fail if _id does not exist', async () => {
    const post = await updatePost('000000000000000000000000', {
      author: 'Failed Author',
    });
    expect(post).toEqual(null);
  });
});

describe('delete posts', () => {
  test('should remove post from DB', async () => {
    const result = await deletePost(createdSamplePosts[0]._id);
    expect(result.deletedCount).toEqual(1);

    const deletedPost = await Post.findById(createdSamplePosts[0]._id);
    expect(deletedPost).toEqual(null);
  });
  test('should fail to delete missing id', async () => {
    const result = await deletePost('000000000000000000000000');
    expect(result.deletedCount).toEqual(0);
  });
});
