const Account = require('../models/account.model');
const Activity = require('../models/activity.model');
const { Post } = require('../models/content.model');
const SearchHistory = require('../models/searchHistory.model');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    try {
        const user = await Account.findById(req.userId)
            .select('-password')
            .populate('relationship.partner', 'username avatar')
            .lean();
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
        const { username, birthday, gender, email, password, address, phone, job, relationship } = req.body;
        
        const updateData = {};
        if (username) updateData.username = username;
        if (birthday) updateData.birthday = birthday;
        if (gender) updateData.gender = gender;
        if (email) updateData.email = email;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (job) updateData.job = job;

        if (relationship) {
            try {
                const rel = typeof relationship === 'string' ? JSON.parse(relationship) : relationship;
                updateData.relationship = {
                    status: rel.status || 'none',
                    partner: (rel.partner && rel.partner !== 'none' && rel.partner !== '') ? rel.partner : null
                };
            } catch (e) {
                updateData.relationship = {
                    status: relationship,
                    partner: null
                };
            }
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            updateData.avatar = req.file.path;
        }

        const updatedUser = await Account.findByIdAndUpdate(req.userId, updateData, { returnDocument: 'after' })
            .select('-password')
            .populate('relationship.partner', 'username avatar')
            .lean();
        
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
        }).select('avatar username email birthday gender address phone job nationality friends followers following privacy').lean();

        const usersWithStats = users.map(user => {
            const stats = {
                friendsCount: user.friends ? user.friends.length : 0,
                followersCount: user.followers ? user.followers.length : 0,
                followingCount: user.following ? user.following.length : 0
            };
            
            delete user.friends;
            delete user.followers;
            delete user.following;

            if (user._id.toString() !== req.userId.toString()) {
                const privacy = user.privacy || {};
                if (privacy.email === false) delete user.email;
                if (privacy.phone === false) delete user.phone;
                if (privacy.address === false) delete user.address;
                if (privacy.birthday === false) delete user.birthday;
                if (privacy.gender === false) delete user.gender;
                if (privacy.job === false) delete user.job;
                if (privacy.nationality === false) delete user.nationality;
            }
            delete user.privacy;

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
        const user = await Account.findById(id)
            .select('-password')
            .populate('relationship.partner', 'username avatar')
            .lean();
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        const postCount = await Post.countDocuments({ author: id });

        if (req.userId.toString() !== id.toString()) {
            const privacy = user.privacy || {};
            const friendIds = user.friends || [];
            const isFriend = friendIds.some(fid => fid.toString() === req.userId.toString());

            if (privacy.isPrivate && !isFriend) {
                delete user.email;
                delete user.phone;
                delete user.address;
                delete user.birthday;
                delete user.gender;
                delete user.job;
                delete user.nationality;
            } else {
                if (privacy.email === false) delete user.email;
                if (privacy.phone === false) delete user.phone;
                if (privacy.address === false) delete user.address;
                if (privacy.birthday === false) delete user.birthday;
                if (privacy.gender === false) delete user.gender;
                if (privacy.job === false) delete user.job;
                if (privacy.nationality === false) delete user.nationality;
            }
        }

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

const requestDeleteAccount = async (req, res) => {
    try {
        const user = await Account.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        let deleteDate = user.deleteAt;
        if (!user.isDeleted || !deleteDate) {
            deleteDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            user.isDeleted = true;
            user.deleteAt = deleteDate;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            code: 'DELETE_ACCOUNT_REQUESTED_SUCCESS',
            deleteAt: deleteDate
        });
    } catch (error) {
        console.error('Error requesting account deletion:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const cancelDeleteAccount = async (req, res) => {
    try {
        const updatedUser = await Account.findByIdAndUpdate(
            req.userId,
            { isDeleted: false, deleteAt: null },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        return res.status(200).json({
            success: true,
            code: 'DELETE_ACCOUNT_CANCELLED_SUCCESS'
        });
    } catch (error) {
        console.error('Error cancelling account deletion:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const reportUser = async (req, res) => {
    try {
        const { targetId, reason } = req.body;
        const reporterId = req.userId;

        if (targetId === reporterId.toString()) {
            return res.status(400).json({ success: false, code: 'CANNOT_REPORT_SELF' });
        }

        const Report = require('../models/report.model');

        const existingReport = await Report.findOne({ reporter: reporterId, target: targetId });
        if (existingReport) {
            return res.status(400).json({ success: false, code: 'REPORT_ALREADY_SUBMITTED' });
        }

        const newReport = new Report({
            reporter: reporterId,
            target: targetId,
            reason: reason || 'Báo cáo vi phạm tiêu chuẩn cộng đồng'
        });
        await newReport.save();

        const targetUser = await Account.findById(targetId);
        if (!targetUser) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        targetUser.reportsCount = (targetUser.reportsCount || 0) + 1;

        const BAN_THRESHOLD = 3;
        if (targetUser.reportsCount >= BAN_THRESHOLD) {
            targetUser.isBanned = true;
            targetUser.banReason = 'Tài khoản của bạn đã bị khóa tự động do nhận quá nhiều báo cáo vi phạm từ cộng đồng.';
        }

        await targetUser.save();

        return res.status(200).json({
            success: true,
            code: 'REPORT_SUBMITTED_SUCCESS',
            reportsCount: targetUser.reportsCount,
            isBanned: targetUser.isBanned
        });
    } catch (error) {
        console.error('Error reporting user:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const appealBan = async (req, res) => {
    try {
        const { appealContent } = req.body;
        const userId = req.userId;

        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        if (!user.isBanned) {
            return res.status(400).json({ success: false, code: 'ACCOUNT_NOT_BANNED' });
        }

        user.banAppealed = true;
        user.appealContent = appealContent || 'Yêu cầu xem xét mở khóa tài khoản';
        await user.save();

        return res.status(200).json({
            success: true,
            code: 'APPEAL_SUBMITTED_SUCCESS'
        });
    } catch (error) {
        console.error('Error submitting ban appeal:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getPrivacy = async (req, res) => {
    try {
        const user = await Account.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        return res.status(200).json({
            success: true,
            privacy: user.privacy || {
                email: true,
                phone: true,
                address: true,
                birthday: true,
                gender: true,
                job: true,
                nationality: true,
                isPrivate: false,
            }
        });
    } catch (error) {
        console.error('Error getting privacy settings:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const updatePrivacy = async (req, res) => {
    try {
        const { email, phone, address, birthday, gender, job, nationality, isPrivate } = req.body;
        
        const user = await Account.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });

        if (!user.privacy) {
            user.privacy = {};
        }

        if (email !== undefined) user.privacy.email = email;
        if (phone !== undefined) user.privacy.phone = phone;
        if (address !== undefined) user.privacy.address = address;
        if (birthday !== undefined) user.privacy.birthday = birthday;
        if (gender !== undefined) user.privacy.gender = gender;
        if (job !== undefined) user.privacy.job = job;
        if (nationality !== undefined) user.privacy.nationality = nationality;
        if (isPrivate !== undefined) user.privacy.isPrivate = isPrivate;

        await user.save();

        return res.status(200).json({
            success: true,
            code: 'PRIVACY_UPDATED_SUCCESS',
            privacy: user.privacy
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const saveSearchHistory = async (req, res) => {
    try {
        const { searchedUserId } = req.body;
        if (!searchedUserId) {
            return res.status(400).json({ success: false, code: 'SEARCHED_USER_ID_REQUIRED' });
        }

        if (searchedUserId === req.userId.toString()) {
            return res.status(200).json({ success: true, code: 'SAVE_SEARCH_HISTORY_SUCCESS' });
        }

        await SearchHistory.findOneAndUpdate(
            { user: req.userId, searchedUser: searchedUserId },
            { updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, code: 'SAVE_SEARCH_HISTORY_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const getSearchHistory = async (req, res) => {
    try {
        const history = await SearchHistory.find({ user: req.userId })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('searchedUser', 'avatar username email birthday gender address phone job nationality friends followers following privacy')
            .lean();

        const formattedUsers = history
            .filter(item => item.searchedUser != null)
            .map(item => {
                const user = item.searchedUser;
                const stats = {
                    friendsCount: user.friends ? user.friends.length : 0,
                    followersCount: user.followers ? user.followers.length : 0,
                    followingCount: user.following ? user.following.length : 0
                };
                
                delete user.friends;
                delete user.followers;
                delete user.following;

                if (user._id.toString() !== req.userId.toString()) {
                    const privacy = user.privacy || {};
                    if (privacy.email === false) delete user.email;
                    if (privacy.phone === false) delete user.phone;
                    if (privacy.address === false) delete user.address;
                    if (privacy.birthday === false) delete user.birthday;
                    if (privacy.gender === false) delete user.gender;
                    if (privacy.job === false) delete user.job;
                    if (privacy.nationality === false) delete user.nationality;
                }
                delete user.privacy;

                return { ...user, stats };
            });

        res.status(200).json({ success: true, code: 'GET_SEARCH_HISTORY_SUCCESS', data: formattedUsers });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const deleteSearchHistory = async (req, res) => {
    try {
        const { searchedUserId } = req.params;
        await SearchHistory.deleteOne({ user: req.userId, searchedUser: searchedUserId });
        res.status(200).json({ success: true, code: 'DELETE_SEARCH_HISTORY_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const clearSearchHistory = async (req, res) => {
    try {
        await SearchHistory.deleteMany({ user: req.userId });
        res.status(200).json({ success: true, code: 'CLEAR_SEARCH_HISTORY_SUCCESS' });
    } catch (error) {
        res.status(500).json({ success: false, code: 'SERVER_ERROR' });
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
    getActivity,             
    requestDeleteAccount,      
    cancelDeleteAccount,
    reportUser,
    appealBan,
    getPrivacy,
    updatePrivacy,
    saveSearchHistory,
    getSearchHistory,
    deleteSearchHistory,
    clearSearchHistory
};