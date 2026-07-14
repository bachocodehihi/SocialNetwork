const { Post, Comment } = require('../models/content.model');
const Account = require('../models/account.model');
const Group = require('../models/group.model');
const { createNotification } = require('./notification.controller');

const createPost = async (req, res) => {
    try {
        const { content, postType, privacy, group, allowedFriends, exceptedFriends } = req.body;
        
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                images.push(file.path);
            });
        }

        if (postType === 'group') {
            if (!group) {
                return res.status(400).json({ success: false, code: 'GROUP_ID_REQUIRED' });
            }
            const targetGroup = await Group.findById(group);
            if (!targetGroup) {
                return res.status(404).json({ success: false, code: 'GROUP_NOT_FOUND' });
            }
            const isMember = targetGroup.members.some(m => m.toString() === req.userId) || targetGroup.admin.toString() === req.userId;
            if (!isMember) {
                return res.status(403).json({ success: false, code: 'NOT_GROUP_MEMBER' });
            }
        }

        let allowed = [];
        if (allowedFriends) {
            try {
                if (typeof allowedFriends === 'string') {
                    if (allowedFriends.startsWith('[')) {
                        allowed = JSON.parse(allowedFriends);
                    } else {
                        allowed = allowedFriends.split(',').map(s => s.trim()).filter(Boolean);
                    }
                } else if (Array.isArray(allowedFriends)) {
                    allowed = allowedFriends;
                }
            } catch (e) {
                console.error("Error parsing allowedFriends:", e);
            }
        }

        let excepted = [];
        if (exceptedFriends) {
            try {
                if (typeof exceptedFriends === 'string') {
                    if (exceptedFriends.startsWith('[')) {
                        excepted = JSON.parse(exceptedFriends);
                    } else {
                        excepted = exceptedFriends.split(',').map(s => s.trim()).filter(Boolean);
                    }
                } else if (Array.isArray(exceptedFriends)) {
                    excepted = exceptedFriends;
                }
            } catch (e) {
                console.error("Error parsing exceptedFriends:", e);
            }
        }

        const newPost = new Post({
            author: req.userId,
            content,
            images,
            postType: postType || 'user',
            privacy: postType === 'group' ? 'friends' : (privacy || 'public'),
            allowedFriends: allowed,
            exceptedFriends: excepted,
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
                // Privacy check before notification
                if (newPost.privacy === 'private') {
                    continue; // Private post, no friends can see
                }
                if (newPost.privacy === 'friends_except') {
                    const isExcepted = excepted.some(id => id.toString() === friendId);
                    if (isExcepted) continue;
                }
                if (newPost.privacy === 'specific_friends') {
                    const isAllowed = allowed.some(id => id.toString() === friendId);
                    if (!isAllowed) continue;
                }

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

        res.status(201).json({ success: true, code: 'POST_CREATED_SUCCESS', post: populatedPost });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getFeed = async (req, res) => {
    try {
        const Account = require('../models/account.model');
        const Group = require('../models/group.model');

        const currentUser = await Account.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
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
                        // 3. Friends except posts
                        {
                            privacy: 'friends_except',
                            $or: [
                                { author: req.userId },
                                {
                                    author: { $in: friendIds },
                                    exceptedFriends: { $ne: req.userId }
                                }
                            ]
                        },
                        // 4. Specific friends posts
                        {
                            privacy: 'specific_friends',
                            $or: [
                                { author: req.userId },
                                { allowedFriends: req.userId }
                            ]
                        },
                        // 5. Private posts by self
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
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, code: 'POST_NOT_FOUND' });

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

        return res.status(200).json({ success: true, code: 'POST_LIKE_SUCCESS', post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const commentPost = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, code: 'POST_NOT_FOUND' });

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

        res.status(201).json({ success: true, code: 'COMMENT_ADDED_SUCCESS', post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        const Account = require('../models/account.model');
        const currentUser = await Account.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        const friendIds = currentUser.friends || [];
        const isFriend = friendIds.some(id => id.toString() === userId);
        const isSelf = userId === req.userId.toString();

        const targetUser = await Account.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        const targetPrivacy = targetUser.privacy || {};
        if (targetPrivacy.isPrivate && !isSelf && !isFriend) {
            return res.status(200).json([]);
        }

        const query = {
            author: userId,
            postType: 'user'
        };

        if (userId !== req.userId) {
            const orConditions = [
                { privacy: 'public' }
            ];
            if (isFriend) {
                orConditions.push({ privacy: 'friends' });
                orConditions.push({
                    privacy: 'friends_except',
                    exceptedFriends: { $ne: req.userId }
                });
            }
            orConditions.push({
                privacy: 'specific_friends',
                allowedFriends: req.userId
            });
            query.$or = orConditions;
        }

        const posts = await Post.find(query)
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
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
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
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const likeComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, code: 'COMMENT_NOT_FOUND' });

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

        return res.status(200).json({ success: true, code: 'COMMENT_LIKE_SUCCESS', post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const likeReply = async (req, res) => {
    try {
        const { commentId, replyId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, code: 'COMMENT_NOT_FOUND' });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ success: false, code: 'REPLY_NOT_FOUND' });

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

        return res.status(200).json({ success: true, code: 'REPLY_LIKE_SUCCESS', post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const replyComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { id: postId, commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, code: 'COMMENT_NOT_FOUND' });

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

        res.status(201).json({ success: true, code: 'REPLY_ADDED_SUCCESS', post: updatedPost });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
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
