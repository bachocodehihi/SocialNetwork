import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'user_controller.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/view/user/user_view.dart';
import 'package:socialnetwork/app/widgets/toast/toast.dart';

class ChatUserView extends StatefulWidget {
  final String receiverId;
  final String receiverName;
  final String receiverAvatar;
  final bool isFriend;
 
  const ChatUserView({
    super.key,
    required this.receiverId,
    required this.receiverName,
    this.receiverAvatar = '',
    this.isFriend = false,
  });
 
  @override
  State<ChatUserView> createState() => _ChatUserViewState();
}
 
class _ChatUserViewState extends State<ChatUserView> {
  late final ChatUserController _controller;
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _hasText = false;
  int _lastMessageCount = 0;
  String? _customBgPath;
 
  @override
  void initState() {
    super.initState();
    _loadBackgroundImage();
    _controller = ChatUserController(
      receiverId: widget.receiverId,
      receiverName: widget.receiverName,
      receiverAvatar: widget.receiverAvatar,
      isFriend: widget.isFriend,
    );
    _textController.addListener(() {
      setState(() => _hasText = _textController.text.trim().isNotEmpty);
    });
    _controller.addListener(_onMessagesChanged);
  }

  Future<void> _loadBackgroundImage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bgKey = 'chat_bg_${widget.receiverId}';
      final path = prefs.getString(bgKey);
      if (path != null) {
        setState(() {
          _customBgPath = path;
        });
      }
    } catch (e) {
      debugPrint('Error loading background image: $e');
    }
  }

  Future<void> _pickBackgroundImage() async {
    try {
      final picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      if (image == null) return;
      
      final prefs = await SharedPreferences.getInstance();
      final bgKey = 'chat_bg_${widget.receiverId}';
      await prefs.setString(bgKey, image.path);
      
      setState(() {
        _customBgPath = image.path;
      });
    } catch (e) {
      debugPrint('Error picking background image: $e');
    }
  }

  Future<void> _clearBackgroundImage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bgKey = 'chat_bg_${widget.receiverId}';
      await prefs.remove(bgKey);
      
      setState(() {
        _customBgPath = null;
      });
    } catch (e) {
      debugPrint('Error clearing background image: $e');
    }
  }

  void _showThemeSettings() {
    final cs = Theme.of(context).colorScheme;
    showModalBottomSheet(
      context: context,
      backgroundColor: cs.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: EdgeInsets.only(top: 8.h, bottom: 16.h),
                width: 40.w,
                height: 4.h,
                decoration: BoxDecoration(
                  color: cs.onSurfaceVariant.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2.r),
                ),
              ),
              Text(
                'Tùy chỉnh giao diện',
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),
              SizedBox(height: 15.h),
              ListTile(
                leading: Icon(
                  Icons.image_outlined, 
                  size: 25.sp,
                  color: Colors.blue
                ),
                title: Text(
                  'Chọn ảnh nền từ album',
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface
                  ),
                ),
                onTap: () {
                  Navigator.pop(context);
                  _pickBackgroundImage();
                },
              ),
              if (_customBgPath != null)
                ListTile(
                  leading: Icon(
                    Icons.delete_outlined,
                    size: 25.sp,
                    color: Colors.red
                  ),
                  title: Text(
                    'Xóa ảnh nền hiện tại',
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: Colors.red
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _clearBackgroundImage();
                  },
                ),
              SizedBox(height: 10.h),
            ],
          ),
        );
      },
    );
  }

  void _showMessageOptions(Map<String, dynamic> msg, bool isMe) {
    final cs = Theme.of(context).colorScheme;
    final messageId = msg['_id']?.toString() ?? msg['id']?.toString();
    final content = msg['content']?.toString() ?? '';
    
    showModalBottomSheet(
      context: context,
      backgroundColor: cs.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: EdgeInsets.only(top: 8.h, bottom: 16.h),
                width: 40.w,
                height: 4.h,
                decoration: BoxDecoration(
                  color: cs.onSurfaceVariant.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2.r),
                ),
              ),
              // Text(
              //   'Tùy chọn tin nhắn',
              //   style: TextStyle(
              //     fontSize: 15.sp,
              //     fontWeight: FontWeight.w500,
              //     color: cs.onSurface,
              //   ),
              // ),
              // SizedBox(height: 15.h),
              if (isMe) ...[
                ListTile(
                  leading: Icon(
                    Icons.cached_outlined,
                    size: 25.sp,
                    color: Colors.orange,
                  ),
                  title: Text(
                    'Thu hồi',
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    if (messageId != null) {
                      _controller.recallMessage(messageId);
                    }
                  },
                ),
                ListTile(
                  leading: Icon(
                    Icons.edit_outlined,
                    size: 25.sp,
                    color: Colors.blue,
                  ),
                  title: Text(
                    'edit',
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _textController.text = content;
                  },
                ),
              ],
              ListTile(
                leading: Icon(
                  Icons.undo_outlined,
                  size: 25.sp,
                  color: Colors.purple,
                ),
                title: Text(
                  'reply',
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
                onTap: () {

                },
              ),
              ListTile(
                leading: Icon(
                  Icons.push_pin_outlined,
                  size: 25.sp,
                  color: Colors.pink,
                ),
                title: Text(
                  'pin',
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
                onTap: () {

                },
              ),
              ListTile(
                leading: Icon(
                  Icons.copy_outlined,
                  size: 25.sp,
                  color: Colors.green,
                ),
                title: Text(
                  'copy',
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
                onTap: () {
                  Navigator.pop(context);
                  Clipboard.setData(ClipboardData(text: content));
                  AppToast.show(context, 'Đã sao chép');
                },
              ),
              ListTile(
                leading: Icon(
                  Icons.delete_outlined,
                  size: 25.sp,
                  color: Colors.red,
                ),
                title: Text(
                  'Xóa',
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: cs.onSurface,
                  ),
                ),
                onTap: () {
                  Navigator.pop(context);
                  if (messageId != null) {
                    _controller.deleteMessage(messageId);
                  }
                },
              ),
              SizedBox(height: 10.h),
            ],
          ),
        );
      },
    );
  }
 
  void _onMessagesChanged() {
    final currentCount = _controller.messages.length;
    if (currentCount > _lastMessageCount) {
      _lastMessageCount = currentCount;
      _scrollToBottom();
    } else {
      _lastMessageCount = currentCount;
    }
  }
 
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }
 
  @override
  void dispose() {
    _controller.removeListener(_onMessagesChanged);
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
 
  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    _controller.sendMessage(text);
    _textController.clear();
    _scrollToBottom();
  }
 
  String? _extractSenderId(dynamic senderRaw) {
    if (senderRaw is Map) {
      return senderRaw['_id']?.toString() ?? senderRaw['id']?.toString();
    }
    return senderRaw?.toString();
  }
 
  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness:
          brightness == Brightness.dark ? Brightness.light : Brightness.dark,
    ));
    final cs = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(
                kIsWeb ? 0 : 24.w,
                16.h,
                kIsWeb ? 0 : 24.w,
                10.h,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Icon(
                          Icons.arrow_back_ios_outlined,
                          size: 20.sp,
                          color: cs.onSurface,
                        ),
                      ),
                      SizedBox(width: 10.w),
                      CircleAvatar(
                        radius: 18.r,
                        backgroundColor: cs.primaryContainer,
                        backgroundImage: widget.receiverAvatar.isNotEmpty
                            ? NetworkImage(widget.receiverAvatar)
                            : null,
                        child: widget.receiverAvatar.isEmpty
                            ? Text(
                                widget.receiverName.substring(0, 1).toUpperCase(),
                                style: TextStyle(
                                  color: cs.onPrimaryContainer,
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w600,
                                ),
                              )
                            : null,
                      ),
                      SizedBox(width: 10.w),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.receiverName,
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w500,
                              color: cs.onSurface,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (widget.isFriend)
                            ListenableBuilder(
                              listenable: _controller,
                              builder: (context, _) {
                                final isOnline = _controller.isReceiverOnline;
                                return Text(
                                  isOnline ? 'Online' : 'Offline',
                                  style: TextStyle(
                                    fontSize: 12.sp,
                                    color: isOnline ? Colors.green : cs.onSurfaceVariant,
                                  ),
                                );
                              },
                            ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () {
                          final conversationId = _controller.conversationId;
                          if (conversationId == null) return;
                          
                          CallService().startCall(
                            receiverId: widget.receiverId,
                            conversationId: conversationId,
                            receiverInfo: {
                              '_id': widget.receiverId,
                              'username': widget.receiverName,
                              'avatar': widget.receiverAvatar,
                            },
                          );
                          Navigator.pushNamed(context, Routes.callOutgoing);
                        },
                        child: Icon(
                          Icons.phone_outlined,
                          size: 25.sp,
                          color: cs.onSurface,
                        ),
                      ),

                      SizedBox(width: 20.w),

                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Icon(
                          Icons.videocam_outlined,
                          size: 25.sp,
                          color: cs.onSurface,
                        ),
                      ),

                      SizedBox(width: 20.w),

                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ViewUserView(
                                userId: widget.receiverId,
                                userName: widget.receiverName,
                                userAvatar: widget.receiverAvatar,
                              ),
                            ),
                          );
                        },
                        child: Icon(
                          Icons.more_vert_outlined,
                          size: 25.sp,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(child: _buildMessagesList(cs)),
            Padding(
              padding: EdgeInsets.fromLTRB(
                kIsWeb ? 0 : 24.w,
                10.h,
                kIsWeb ? 0 : 24.w,
                16.h,
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {},
                    child: Icon(
                      Icons.image_outlined, 
                      size: 25.sp,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(width: 20.w),

                  GestureDetector(
                    onTap: () {},
                    child: Icon(
                      Icons.mic_outlined, 
                      size: 25.sp,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(width: 10.w),

                  Expanded(
                    child: TextField(
                      controller: _textController,
                      enabled: !_controller.isSending,
                      decoration: InputDecoration(
                        hintText: 'Nhắn tin...',
                        hintStyle: TextStyle(
                          fontSize: 14.sp,
                          color: cs.onSurfaceVariant.withValues(alpha: 0.6),
                        ),
                        filled: true,
                        fillColor: cs.surfaceContainerHighest,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16.w,
                          vertical: 10.h,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24.r),
                          borderSide: BorderSide.none,
                        ),
                        isDense: true,
                      ),
                      maxLines: 4,
                      minLines: 1,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),

                  SizedBox(width: 10.w),

                  GestureDetector(
                    onTap: _hasText ? _sendMessage : null,
                    child: Icon(
                      Icons.send_outlined,
                      color: _hasText ? Colors.blue : cs.onSurface,
                      size: 25.sp,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
 
  Widget _buildMessagesList(ColorScheme cs) {
    final hasBgImage = _customBgPath != null && File(_customBgPath!).existsSync();

    return GestureDetector(
      onLongPress: _showThemeSettings,
      behavior: HitTestBehavior.translucent,
      child: Container(
        decoration: BoxDecoration(
          color: cs.surfaceDim,
          image: hasBgImage
              ? DecorationImage(
                  image: FileImage(File(_customBgPath!)),
                  fit: BoxFit.cover,
                )
              : null,
        ),
        child: ListenableBuilder(
          listenable: _controller,
          builder: (context, _) {
            if (_controller.isLoading && _controller.messages.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }
            if (_controller.error != null) {
              return Center(
                child: Text(
                  '${_controller.error}',
                  style: TextStyle(
                    color: cs.error
                  )
                )
              );
            }
            if (_controller.messages.isEmpty) {
              return Center(
                child: Text(
                  'No messages yet',
                  style: TextStyle(
                    color: cs.onSurfaceVariant
                  )
                )
              );
            }
    
            return ListView.builder(
              controller: _scrollController,
              padding: EdgeInsets.symmetric(
                horizontal: kIsWeb ? 0 : 5.w, 
                vertical: 12.h
              ),
              itemCount: _controller.messages.length,
              shrinkWrap: false,
              cacheExtent: 500,
              itemBuilder: (context, i) {
                final msg = _controller.messages[i];
                final msgSenderId = _extractSenderId(msg['sender']);
                final isMe = msgSenderId == _controller.currentUserId;
    
                final prevMsgSenderId = i == 0
                    ? null
                    : _extractSenderId(_controller.messages[i - 1]['sender']);
                final showAvatar = i == 0 || prevMsgSenderId != msgSenderId;
    
                final msgId = msg['_id']?.toString() ??
                    msg['id']?.toString() ??
                    'msg_${i}_${msg['content']?.hashCode ?? 0}';
    
                final createdAt = msg['createdAt'] != null
                    ? (msg['createdAt'] is String 
                        ? DateTime.tryParse(msg['createdAt'])?.toLocal()
                        : msg['createdAt'] is int 
                            ? DateTime.fromMillisecondsSinceEpoch(msg['createdAt']).toLocal()
                            : null)
                    : null;
    
                final showDate = i == 0 || 
                    (createdAt != null && _shouldShowDateSeparator(
                      createdAt, 
                      _controller.messages[i - 1]['createdAt']
                    ));
    
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (showDate && createdAt != null)
                      _DateSeparator(date: createdAt),
                    RepaintBoundary(
                      child: Padding(
                        padding: EdgeInsets.only(bottom: 6.h),
                        child: Row(
                          key: ValueKey('msg_$msgId'),
                          mainAxisAlignment:
                              isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            if (!isMe) ...[
                              showAvatar
                                  ? CircleAvatar(
                                      radius: 14.r,
                                      backgroundColor: cs.primaryContainer,
                                      backgroundImage: widget.receiverAvatar.isNotEmpty
                                          ? NetworkImage(widget.receiverAvatar)
                                          : null,
                                      child: widget.receiverAvatar.isEmpty
                                          ? Icon(Icons.person_outlined,
                                              size: 16.sp, 
                                              color: cs.onPrimaryContainer
                                            )
                                          : null,
                                    )
                                  : SizedBox(width: 28.w),
                              SizedBox(width: 8.w),
                            ],
                            GestureDetector(
                              onLongPress: () => _showMessageOptions(msg, isMe),
                              child: ConstrainedBox(
                                constraints: BoxConstraints(maxWidth: 0.65.sw),
                                child: Column(
                                  crossAxisAlignment: isMe
                                      ? CrossAxisAlignment.end
                                      : CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 14.w, vertical: 10.h
                                      ),
                                      decoration: BoxDecoration(
                                        color: isMe
                                            ? Colors.blue
                                            : Color(0xFFD6D6D6),
                                        borderRadius: BorderRadius.only(
                                          topLeft: Radius.circular(18.r),
                                          topRight: Radius.circular(18.r),
                                          bottomLeft:
                                              Radius.circular(isMe ? 18.r : 4.r),
                                          bottomRight:
                                              Radius.circular(isMe ? 4.r : 18.r),
                                        ),
                                      ),
                                      child: Text(
                                        msg['content'] ?? '',
                                        style: TextStyle(
                                          fontSize: 14.sp,
                                          color: isMe ? Colors.white : Colors.black,
                                        ),
                                      ),
                                    ),
                                    SizedBox(height: 3.h),
                                    Text(
                                      _formatTime(msg['createdAt']),
                                      style: TextStyle(
                                        fontSize: 10.sp,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            if (isMe) SizedBox(width: 5.w),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }
 
  bool _shouldShowDateSeparator(DateTime current, dynamic previous) {
    if (previous == null) return true;
    final prevDate = previous is String
        ? DateTime.tryParse(previous)?.toLocal()
        : previous is int
            ? DateTime.fromMillisecondsSinceEpoch(previous).toLocal()
            : null;
    if (prevDate == null) return true;
    
    return current.year != prevDate.year ||
           current.month != prevDate.month ||
           current.day != prevDate.day;
  }
 
  String _formatTime(dynamic t) {
    if (t == null) return '';
    final dt = t is String
        ? DateTime.tryParse(t)?.toLocal()
        : t is int
            ? DateTime.fromMillisecondsSinceEpoch(t).toLocal()
            : null;
    return dt != null
        ? '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}'
        : '';
  }
}
 
class _DateSeparator extends StatelessWidget {
  final DateTime date;
  
  const _DateSeparator({required this.date});
 
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final formatted = DateFormat('EEEE, MMMM d').format(date);
    
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 16.h),
      child: Center(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: cs.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Text(
            formatted,
            style: TextStyle(
              fontSize: 11.sp,
              color: cs.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}