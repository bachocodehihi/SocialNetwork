const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const Account = require('../models/account.model');
const OTP = require('../models/otp.model');
const { Post } = require('../models/content.model');
const { sendOTP } = require('../services/email.service');
const { cloudinary } = require('../config/cloudinary');

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        await OTP.deleteMany({ email });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const newOTP = new OTP({ email, otp: otpCode });
        await newOTP.save();

        await sendOTP(email, otpCode);

        return res.status(200).json({ 
            success: true, 
            code: 'OTP_SENT_SUCCESS' 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ 
                success: false, 
                code: 'OTP_INVALID' 
            });
        }

        const now = new Date();
        if (now.getTime() - otpRecord.otpTime.getTime() > 60 * 1000) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ 
                success: false, 
                code: 'OTP_EXPIRED' 
            });
        }

        otpRecord.isVerified = true;
        await otpRecord.save();

        return res.status(200).json({ 
            success: true, 
            code: 'OTP_VERIFIED' 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const register = async (req, res) => {
    try {
        const { email, username, password, birthday, gender, avatar: avatarBase64 } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        let finalAvatar = process.env.DEFAULT_AVATAR_URL;

        if (avatarBase64) {
            let uploadStr = avatarBase64;
            if (!uploadStr.startsWith('data:image')) {
                uploadStr = `data:image/jpeg;base64,${uploadStr}`;
            }
            const uploadResponse = await cloudinary.uploader.upload(uploadStr, {
                folder: 'socialnetwork'
            });
            finalAvatar = uploadResponse.secure_url;
        } else if (req.file) {
            finalAvatar = req.file.path;
        }

        const newUser = new Account({
            email,
            username,
            password: hashedPassword,
            birthday,
            gender,
            avatar: finalAvatar,
            isVerified: true
        });

        const savedUser = await newUser.save();

        const qrDataUrl = await QRCode.toDataURL(savedUser._id.toString());

        const qrUploadResponse = await cloudinary.uploader.upload(qrDataUrl, {
            folder: 'socialnetwork/qrcodes'
        });

        savedUser.qrCode = qrUploadResponse.secure_url;
        await savedUser.save();

        await OTP.deleteMany({ email });
        const userObj = savedUser.toObject();
        delete userObj.password;
        return res.status(201).json({
            success: true,
            code: 'REGISTER_SUCCESS',
            data: userObj
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'SERVER_ERROR'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Account.findOne({ email });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                code: 'INCORRECT_PASSWORD' 
            });
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        const postCount = await Post.countDocuments({ author: user._id });
        const userObj = user.toObject();
        delete userObj.password;

        userObj.stats = {
            friendsCount: userObj.friends?.length ?? 0,
            followersCount: userObj.followers?.length ?? 0,
            followingCount: userObj.following?.length ?? 0,
            postCount
        };

        return res.status(200).json({ 
            success: true, 
            code: 'LOGIN_SUCCESS', 
            token, 
            user: userObj,
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Account.findOne({ email });

        if (!user) {
            return res.status(200).json({ 
                success: false, 
                code: 'EMAIL_NOT_EXIST',
                exists: false
            });
        }

        return res.status(200).json({ 
            success: true, 
            code: 'EMAIL_REGISTERED',
            exists: true
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await Account.findOne({ email });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        await OTP.deleteMany({ email });

        return res.status(200).json({ 
            success: true, 
            code: 'FORGOT_PASSWORD_SUCCESS',
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            code: 'SERVER_ERROR' 
        });
    }
};

const generateQRCode = async (req, res) => {
  try {
    const crypto = require('crypto');
    
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    const qrPayload = {
      sessionId,
      type: 'login',
      timestamp: Date.now(),
      expiresIn: 300
    };

    await OTP.create({
      email: `qr_session:${sessionId}`,
      otp: JSON.stringify(qrPayload),
      otpTime: new Date(),
      isVerified: false
    });
    
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrPayload));
    
    return res.status(200).json({
      success: true,
      code: 'QR_GENERATED',
      data: {
        sessionId,
        qrCodeImage,
        expiresIn: 300
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR'
    });
  }
};

const checkQRStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await OTP.findOne({ 
      email: `qr_session:${sessionId}`,
      otp: { $regex: '"type":"login"' }
    });
    
    if (!session) {
      return res.status(200).json({
        success: true,
        code: 'QR_NOT_FOUND',
        status: 'expired'
      });
    }
    
    const now = new Date();
    const sessionTime = new Date(session.otpTime);
    if (now.getTime() - sessionTime.getTime() > 300 * 1000) {
      await OTP.deleteOne({ _id: session._id });
      return res.status(200).json({
        success: true,
        code: 'QR_EXPIRED',
        status: 'expired'
      });
    }
    
    let status = 'waiting';
    let token = null;
    if (session.isVerified) {
      status = 'confirmed';
      try {
        const otpData = JSON.parse(session.otp);
        const userId = otpData.userId;
        if (userId) {
          token = jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
        }
      } catch (err) {
        console.error('Error generating token in checkQRStatus:', err);
      }
      await OTP.deleteOne({ _id: session._id });
    }
    
    return res.status(200).json({
      success: true,
      code: 'QR_STATUS_OK',
      status,
      sessionId,
      token
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR'
    });
  }
};

const confirmQRLogin = async (req, res) => {
  try {
    const { sessionId, token } = req.body;
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_MOBILE_TOKEN'
      });
    }
    
    const session = await OTP.findOne({ 
      email: `qr_session:${sessionId}`,
      otp: { $regex: '"type":"login"' }
    });
    
    if (!session) {
      return res.status(400).json({
        success: false,
        code: 'QR_SESSION_NOT_FOUND'
      });
    }
    
    const now = new Date();
    const sessionTime = new Date(session.otpTime);
    if (now.getTime() - sessionTime.getTime() > 300 * 1000) {
      await OTP.deleteOne({ _id: session._id });
      return res.status(400).json({
        success: false,
        code: 'QR_EXPIRED'
      });
    }
    
    session.isVerified = true;
    session.otp = JSON.stringify({ 
      ...JSON.parse(session.otp), 
      confirmedAt: Date.now(),
      userId: decoded.id 
    });
    await session.save();
    
    const webToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({
      success: true,
      code: 'QR_LOGIN_CONFIRMED',
      token: webToken
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = { 
  sendOtp, 
  checkEmail, 
  register, 
  verifyOtp, 
  login,
  forgotPassword,
  generateQRCode,
  checkQRStatus,
  confirmQRLogin
};
