const Account = require('../models/account.model');
const Report = require('../models/report.model');

const getBannedUsers = async (req, res) => {
    try {
        const bannedUsers = await Account.find(
            { isBanned: true },
            '_id email username avatar banReason banAppealed appealContent reportsCount createdAt'
        ).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            code: 'GET_BANNED_USERS_SUCCESS',
            data: bannedUsers
        });
    } catch (error) {
        console.error('Error fetching banned users:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

const resolveAppeal = async (req, res) => {
    try {
        const { targetUserId, action } = req.body;

        if (!targetUserId || !action) {
            return res.status(400).json({ success: false, code: 'MISSING_FIELDS' });
        }

        const targetUser = await Account.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, code: 'USER_NOT_FOUND' });
        }

        if (!targetUser.isBanned) {
            return res.status(400).json({ success: false, code: 'USER_NOT_BANNED' });
        }

        if (action === 'approve') {
            targetUser.isBanned = false;
            targetUser.banReason = '';
            targetUser.banAppealed = false;
            targetUser.appealContent = '';
            targetUser.reportsCount = 0;
            await targetUser.save();

            await Report.deleteMany({ target: targetUserId });

            return res.status(200).json({
                success: true,
                code: 'APPEAL_APPROVED_SUCCESS',
                message: 'Tài khoản đã được mở khóa thành công và xóa sạch lịch sử vi phạm.'
            });
        } else if (action === 'reject') {
            targetUser.banAppealed = false;
            targetUser.appealContent = '';
            targetUser.banReason = 'Đơn kháng cáo của bạn đã bị Admin từ chối do giải trình chưa hợp lý. Vui lòng giải trình lại chính xác hơn.';
            await targetUser.save();

            return res.status(200).json({
                success: true,
                code: 'APPEAL_REJECTED_SUCCESS',
                message: 'Đơn khiếu nại đã bị bác bỏ.'
            });
        } else {
            return res.status(400).json({ success: false, code: 'INVALID_ACTION' });
        }
    } catch (error) {
        console.error('Error resolving appeal:', error);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};

module.exports = {
    getBannedUsers,
    resolveAppeal
};
