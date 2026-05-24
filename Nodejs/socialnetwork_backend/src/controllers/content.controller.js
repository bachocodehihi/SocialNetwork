const { Post, Comment } = require('../models/content.model');
const Account = require('../models/account.model');
const { createNotification } = require('./notification.controller');

const createPost = async (req, res) => {
    try {
        const { content, postType, privacy, group } = req.body;
        
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                images.push(file.path);
            });
        }

        if (postType === 'group') {
            if (!group) {
                return res.status(400).json({ message: "Group ID is required for group post!" });
            }
            const Group = require('../models/group.model');
            const targetGroup = await Group.findById(group);
            if (!targetGroup) {
                return res.status(404).json({ message: "Group not found!" });
            }
            const isMember = targetGroup.members.includes(req.userId) || targetGroup.admin.toString() === req.userId;
            if (!isMember) {
                return res.status(403).json({ message: "You are not a member of this group!" });
            }
        }

        const newPost = new Post({
            author: req.userId,
            content,
            images,
            postType: postType || 'user',
            privacy: postType === 'group' ? 'friends' : (privacy || 'public'),
            group: postType === 'group' ? group : null
        });

        await newPost.save();
        
        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'username avatar')
            .populate('group', 'name avatar');

        // Create new post notifications for friends
        try {
            const currentUser = await Account.findById(req.userId);
            const friends = currentUser.friends || [];
            const uniqueFriendIds = [...new Set(friends.map(id => id.toString()))];
            for (const friendId of uniqueFriendIds) {
                await createNotification({
                    recipient: friendId,
                    sender: req.userId,
                    type: 'new_post',
                    title: 'Bài viết mới từ bạn bè',
                    body: `${currentUser.username} vừa đăng một bài viết mới.`,
                    relatedId: newPost._id
                });
            }
        } catch (notifErr) {
            console.error('Failed to send new post notifications:', notifErr);
        }

        res.status(201).json({ message: "Post created successfully!", post: populatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFeed = async (req, res) => {
    try {
        const Account = require('../models/account.model');
        const Group = require('../models/group.model');

        const currentUser = await Account.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const friendIds = currentUser.friends || [];
        
        const myGroups = await Group.find({
            $or: [
                { admin: req.userId },
                { members: req.userId }
            ]
        });
        const groupIds = myGroups.map(g => g._id);

        const posts = await Post.find({
            $or: [
                {
                    postType: 'user',
                    $or: [
                        // 1. Any public post
                        { privacy: 'public' },
                        // 2. Friends-only posts by self or friends
                        {
                            privacy: 'friends',
                            $or: [
                                { author: req.userId },
                                { author: { $in: friendIds } }
                            ]
                        },
                        // 3. Private posts by self
                        {
                            privacy: 'private',
                            author: req.userId
                        }
                    ]
                },
                {
                    postType: 'group',
                    group: { $in: groupIds }
                }
            ]
        })
        .populate('author', 'username avatar')
        .populate({
            path: 'comments',
            populate: [
                {
                    path: 'author',
                    select: 'username avatar'
                },
                {
                    path: 'replies.author',
                    select: 'username avatar'
                }
            ]
        })
        .populate('group', 'name avatar')
        .sort({ createdAt: -1 })
        .lean();

        // Shuffling randomly as requested
        for (let i = posts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [posts[i], posts[j]] = [posts[j], posts[i]];
        }

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found!" });

        if (post.likes.includes(req.userId)) {
            post.likes.pull(req.userId);
        } else {
            post.likes.push(req.userId);
            
            try {
                if (post.author.toString() !== req.userId) {
                    const currentUser = await Account.findById(req.userId);
                    await createNotification({
                        recipient: post.author,
                        sender: req.userId,
                        type: 'post_like',
                        title: 'Lượt thích mới',
                        body: `${currentUser.username} đã thích bài viết của bạn.`,
                        relatedId: post._id
                    });
                }
            } catch (notifErr) {
                console.error('Failed to send post like notification:', notifErr);
            }
        }
        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'username avatar'
                    },
                    {
                        path: 'replies.author',
                        select: 'username avatar'
                    }
                ]
            })
            .populate('group', 'name avatar');

        return res.status(200).json({ message: "Post liked/unliked successfully!", post: updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const commentPost = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found!" });

        const newComment = new Comment({
            author: req.userId,
            post: postId,
            content
        });
        await newComment.save();

        post.comments.push(newComment._id);
        await post.save();

        // Create notification for comment
        try {
            if (post.author.toString() !== req.userId) {
                const currentUser = await Account.findById(req.userId);
                await createNotification({
                    recipient: post.author,
                    sender: req.userId,
                    type: 'post_comment',
                    title: 'Bình luận mới',
                    body: `${currentUser.username} đã bình luận về bài viết của bạn.`,
                    relatedId: post._id
                });
            }
        } catch (notifErr) {
            console.error('Failed to send post comment notification:', notifErr);
        }

        const updatedPost = await Post.findById(postId)
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'username avatar'
                    },
                    {
                        path: 'replies.author',
                        select: 'username avatar'
                    }
                ]
            })
            .populate('group', 'name avatar');

        res.status(201).json({ message: "Comment added successfully!", post: updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await Post.find({
            author: userId,
            postType: 'user'
        })
        .populate('author', 'username avatar')
        .populate({
            path: 'comments',
            populate: [
                {
                    path: 'author',
                    select: 'username avatar'
                },
                {
                    path: 'replies.author',
                    select: 'username avatar'
                }
            ]
        })
        .populate('group', 'name avatar')
        .sort({ createdAt: -1 })
        .lean();

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;

        const posts = await Post.find({
            group: groupId,
            postType: 'group'
        })
        .populate('author', 'username avatar')
        .populate({
            path: 'comments',
            populate: [
                {
                    path: 'author',
                    select: 'username avatar'
                },
                {
                    path: 'replies.author',
                    select: 'username avatar'
                }
            ]
        })
        .populate('group', 'name avatar')
        .sort({ createdAt: -1 })
        .lean();

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found!" });

        if (comment.likes.includes(req.userId)) {
            comment.likes.pull(req.userId);
        } else {
            comment.likes.push(req.userId);
        }
        await comment.save();

        const updatedPost = await Post.findById(comment.post)
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'username avatar'
                    },
                    {
                        path: 'replies.author',
                        select: 'username avatar'
                    }
                ]
            })
            .populate('group', 'name avatar');

        return res.status(200).json({ message: "Comment liked/unliked successfully!", post: updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeReply = async (req, res) => {
    try {
        const { commentId, replyId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found!" });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found!" });

        if (reply.likes.includes(req.userId)) {
            reply.likes.pull(req.userId);
        } else {
            reply.likes.push(req.userId);
        }
        await comment.save();

        const updatedPost = await Post.findById(comment.post)
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'username avatar'
                    },
                    {
                        path: 'replies.author',
                        select: 'username avatar'
                    }
                ]
            })
            .populate('group', 'name avatar');

        return res.status(200).json({ message: "Reply liked/unliked successfully!", post: updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const replyComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { id: postId, commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found!" });

        comment.replies.push({
            author: req.userId,
            content
        });
        await comment.save();

        const updatedPost = await Post.findById(postId)
            .populate('author', 'username avatar')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'author',
                        select: 'username avatar'
                    },
                    {
                        path: 'replies.author',
                        select: 'username avatar'
                    }
                ]
            })
            .populate('group', 'name avatar');

        res.status(201).json({ message: "Reply added successfully!", post: updatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    createPost, 
    getFeed, 
    likePost, 
    commentPost, 
    getUserPosts, 
    getGroupPosts,
    likeComment,
    likeReply,
    replyComment
};
