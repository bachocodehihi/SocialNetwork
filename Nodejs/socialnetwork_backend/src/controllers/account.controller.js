const Account = require('../models/account.model');
const Activity = require('../models/activity.model');
const { Post } = require('../models/content.model');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    try {
        const user = await Account.findById(req.userId).select('-password').lean();
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        const postCount = await Post.countDocuments({ author: req.userId });

        user.stats = {
            friendsCount: user.friends ? user.friends.length : 0,
            followersCount: user.followers ? user.followers.length : 0,
            followingCount: user.following ? user.following.length : 0,
            postCount: postCount
        };

        res.status(200).json({ success: true, code: 'GET_PROFILE_SUCCESS', ...user });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, birthday, gender, email, password, address, phone, job } = req.body;
        
        const updateData = {};
        if (username) updateData.username = username;
        if (birthday) updateData.birthday = birthday;
        if (gender) updateData.gender = gender;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (job) updateData.job = job;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            updateData.avatar = req.file.path;
        }

        const updatedUser = await Account.findByIdAndUpdate(req.userId, updateData, { new: true }).select('-password').lean();
        
        const postCount = await Post.countDocuments({ author: req.userId });

        updatedUser.stats = {
            friendsCount: updatedUser.friends ? updatedUser.friends.length : 0,
            followersCount: updatedUser.followers ? updatedUser.followers.length : 0,
            followingCount: updatedUser.following ? updatedUser.following.length : 0,
            postCount: postCount
        };

        res.status(200).json({ success: true, code: 'UPDATE_PROFILE_SUCCESS', user: updatedUser });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR'
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, code: 'QUERY_REQUIRED' });
        }

        const users = await Account.find({
            username: { $regex: q, $options: 'i' }
        }).select('avatar username email birthday gender address phone job nationality friends followers following').lean();

        const usersWithStats = users.map(user => {
            const stats = {
                friendsCount: user.friends ? user.friends.length : 0,
                followersCount: user.followers ? user.followers.length : 0,
                followingCount: user.following ? user.following.length : 0
            };
            
            delete user.friends;
            delete user.followers;
            delete user.following;

            return { ...user, stats };
        });

        res.status(200).json({ success: true, code: 'SEARCH_USERS_SUCCESS', data: usersWithStats });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Account.findById(id).select('-password').lean();
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        const postCount = await Post.countDocuments({ author: id });

        return res.status(200).json({
            success: true,
            code: 'GET_USER_BY_ID_SUCCESS',
            ...user,
            friendsCount: user.friends?.length ?? 0,
            followersCount: user.followers?.length ?? 0,
            followingCount: user.following?.length ?? 0,
            postCount,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR'
        });
    }
};

const saveFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({ success: false, code: 'TOKEN_REQUIRED' });
        }
        
        await Account.updateMany({ fcmToken }, { fcmToken: null });
        
        await Account.findByIdAndUpdate(req.userId, { fcmToken });
        res.json({ success: true, code: 'SAVE_FCM_TOKEN_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const removeFcmToken = async (req, res) => {
    try {
        await Account.findByIdAndUpdate(req.userId, { fcmToken: null });
        res.json({ success: true, code: 'REMOVE_FCM_TOKEN_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const addPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        await Account.findByIdAndUpdate(req.userId, { $set: { phone } });
        return res.json({ 
            success: true,
            code: 'PHONE_ADDED_SUCCESS' 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const addAddress = async (req, res) => {
    try {
        const { address } = req.body;
        await Account.findByIdAndUpdate(req.userId, { $set: { address } });
        return res.json({ 
            success: true,
            code: 'ADDRESS_ADD_SUCCESS' 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const addJob = async (req, res) => {
    try {
        const { job } = req.body;

        await Account.findByIdAndUpdate(req.userId, { $set: { job } });

        return res.json({ 
            success: true,
            code: 'Job_ADD_SUCCESS' 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const addNationality = async (req, res) => {
    try {
        const { nationality } = req.body;

        await Account.findByIdAndUpdate(req.userId, { $set: { nationality } });

        return res.json({ 
            success: true,
            code: 'NATIONALITY_ADD_SUCCESS' 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const getActivity = async (req, res) => {
    try {
        const userId = req.userId;
        const today = new Date();
        
        const dayOfWeek = today.getDay();
        const distanceToMonday = (dayOfWeek === 0) ? 6 : (dayOfWeek - 1);
        
        const currentWeekDays = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - distanceToMonday + i);
            currentWeekDays.push(d.toISOString().split('T')[0]);
        }

        const activities = await Activity.find({
            userId,
            date: { $in: currentWeekDays }
        }).lean();

        const activityMap = {};
        activities.forEach(a => activityMap[a.date] = a.totalSeconds);

        const { getSessionStarts } = require('../socket');
        const sessionStarts = getSessionStarts();
        const currentSessionStart = sessionStarts.get(userId.toString());
        
        const result = currentWeekDays.map(date => {
            let seconds = activityMap[date] || 0;
            const isToday = date === today.toISOString().split('T')[0];
            
            if (isToday && currentSessionStart) {
                const currentDuration = Math.floor((Date.now() - currentSessionStart) / 1000);
                seconds += currentDuration;
            }
            
            return {
                date,
                minutes: Math.ceil(seconds / 60)
            };
        });

        res.json({ success: true, code: 'GET_ACTIVITY_SUCCESS', data: result });
    } catch (error) {
        console.error('Error in getActivity:', error);
        res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR'
        });
    }
};

module.exports = { 
    getProfile, 
    updateProfile, 
    searchUsers, 
    getUserById, 
    saveFcmToken, 
    removeFcmToken,
    addPhone,
    addAddress,
    addJob,
    addNationality,
    getActivity
};