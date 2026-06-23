import 'dart:io';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:audioplayers/audioplayers.dart';
import 'user_controller.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';
import 'package:socialnetwork/app/pages/main/user/tabs/message/view/user/user_view.dart';
import 'package:socialnetwork/app/widgets/toast/toast.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';

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

  bool _isRecording = false;
  bool _isCancelHovered = false;
  DateTime? _recordingStartTime;
  Timer? _recordingTimer;
  Duration _recordingDuration = Duration.zero;
  final AudioRecorder _audioRecorder = AudioRecorder();
  String? _tempRecordPath;
  double _dragOffsetDx = 0.0;
 
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
    final isRecalled = msg['isRecalled'] == true;
    
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
              if (!isRecalled) ...[
                if (isMe) ...[
                  ListTile(
                    leading: Icon(
                      Icons.cached_outlined,
                      size: 25.sp,
                      color: Colors.orange,
                    ),
                    title: Text(
                      Language.of(context, 'recall'),
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
                      Language.of(context, 'edit'),
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
                    Language.of(context, 'reply'),
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
                    Language.of(context, 'pin'),
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
                    Language.of(context, 'copy'),
                    style: TextStyle(
                      fontSize: 15.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    Clipboard.setData(ClipboardData(text: content));
                    AppToast.show(
                      context, 
                      Language.of(context, 'copied')
                    );
                  },
                ),
              ],
                ListTile(
                leading: Icon(
                  Icons.delete_outlined,
                  size: 25.sp,
                  color: Colors.red,
                ),
                title: Text(
                  Language.of(context, 'delete'),
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
    _recordingTimer?.cancel();
    _audioRecorder.dispose();
    _controller.dispose();
    super.dispose();
  }
 
  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    _controller.sendMessage(text);
    _textController.clear();
    _scrollToBottom();
  }

  Future<void> _sendImage() async {
    try {
      final picker = ImagePicker();
      final List<XFile> images = await picker.pickMultiImage();
      if (images.isEmpty) return;
      
      final paths = images.map((img) => img.path).toList();
      await _controller.sendImageMessages(paths);
    } catch (e) {
      debugPrint('Error picking message images: $e');
    }
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
                                  fontWeight: FontWeight.w500,
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
                                  isOnline ? Language.of(context, 'online') : Language.of(context, 'offline'),
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
            ListenableBuilder(
              listenable: _controller,
              builder: (context, _) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_controller.isSending)
                      const LinearProgressIndicator(minHeight: 2),
                    Padding(
                      padding: EdgeInsets.fromLTRB(
                        kIsWeb ? 0 : 24.w,
                        10.h,
                        kIsWeb ? 0 : 24.w,
                        16.h,
                      ),
                      child: _isRecording
                          ? Row(
                              children: [
                                GestureDetector(
                                  onTap: _cancelRecording,
                                  child: Icon(
                                    Icons.delete,
                                    color: Colors.red,
                                    size: 28.sp,
                                  ),
                                ),
                                SizedBox(width: 15.w),
                                Expanded(
                                  child: Container(
                                    padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
                                    decoration: BoxDecoration(
                                      color: cs.surfaceContainerHighest,
                                      borderRadius: BorderRadius.circular(24.r),
                                    ),
                                    child: Row(
                                      children: [
                                        _RecordingDot(),
                                        SizedBox(width: 8.w),
                                        Text(
                                          _formatDuration(_recordingDuration),
                                          style: TextStyle(
                                            color: Colors.red,
                                            fontWeight: FontWeight.w500,
                                            fontSize: 14.sp,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                SizedBox(width: 15.w),
                                GestureDetector(
                                  onTap: _stopAndSendRecording,
                                  child: Icon(
                                    Icons.send_outlined,
                                    color: Colors.blue,
                                    size: 25.sp,
                                  ),
                                ),
                              ],
                            )
                          : Row(
                              children: [
                                GestureDetector(
                                  onTap: _controller.isSending ? null : _sendImage,
                                  child: Icon(
                                    Icons.image_outlined, 
                                    size: 25.sp,
                                    color: _controller.isSending ? cs.onSurface.withValues(alpha: 0.3) : cs.onSurface,
                                  ),
                                ),

                                SizedBox(width: 20.w),

                                GestureDetector(
                                  onTap: _startRecording,
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
                                        color: cs.onSurface,
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
                                  onTap: _hasText && !_controller.isSending ? _sendMessage : null,
                                  child: Icon(
                                    Icons.send_outlined,
                                    color: _hasText && !_controller.isSending ? Colors.blue : cs.onSurface,
                                    size: 25.sp,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ],
                );
              },
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
                final isRecalled = msg['isRecalled'] == true;
                final isImageMsg = msg['type'] == 'image';
                final isAudioMsg = msg['type'] == 'audio';
                final attachments = msg['attachments'] as List?;
                final hasAttachment = attachments != null && attachments.isNotEmpty;
    
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
                                      padding: (isImageMsg && hasAttachment && !isRecalled)
                                          ? EdgeInsets.zero
                                          : isAudioMsg
                                              ? EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h)
                                              : EdgeInsets.symmetric(
                                                  horizontal: 14.w, vertical: 10.h
                                                ),
                                      decoration: BoxDecoration(
                                        color: isRecalled
                                            ? (isMe ? cs.surfaceContainerHighest.withValues(alpha: 0.5) : cs.surfaceContainerHighest.withValues(alpha: 0.3))
                                            : (isImageMsg && hasAttachment)
                                                ? Colors.transparent
                                                : (isMe ? Colors.blue : const Color(0xFFD6D6D6)),
                                        border: isRecalled ? Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)) : null,
                                        borderRadius: BorderRadius.only(
                                          topLeft: Radius.circular(18.r),
                                          topRight: Radius.circular(18.r),
                                          bottomLeft:
                                              Radius.circular(isMe ? 18.r : 4.r),
                                          bottomRight:
                                              Radius.circular(isMe ? 4.r : 18.r),
                                        ),
                                      ),
                                      child: isRecalled
                                          ? Text(
                                              isMe ? 
                                                  Language.of(context, 'you_unsent_a_message') : Language.of(context, 'this_message_was_deleted'),
                                              style: TextStyle(
                                                fontSize: 14.sp,
                                                color: cs.onSurfaceVariant.withValues(alpha: 0.6),
                                                fontStyle: FontStyle.italic,
                                              ),
                                            )
                                          : (isImageMsg && hasAttachment)
                                              ? _MessageImageGrid(imageUrls: attachments)
                                              : isAudioMsg
                                                  ? _AudioMessageBubble(audioUrl: attachments?.first?.toString() ?? '', isMe: isMe)
                                                  : Text(
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

  Future<void> _startRecording() async {
    try {
      if (!await _audioRecorder.hasPermission()) {
        AppToast.show(context, 'Vui lòng cấp quyền ghi âm');
        return;
      }
      
      final tempDir = await getTemporaryDirectory();
      _tempRecordPath = '${tempDir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
      
      await _audioRecorder.start(
        const RecordConfig(encoder: AudioEncoder.aacLc), 
        path: _tempRecordPath!,
      );

      HapticFeedback.heavyImpact();

      setState(() {
        _isRecording = true;
        _isCancelHovered = false;
        _dragOffsetDx = 0.0;
        _recordingDuration = Duration.zero;
        _recordingStartTime = DateTime.now();
      });

      _recordingTimer?.cancel();
      _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (mounted && _isRecording) {
          setState(() {
            _recordingDuration = DateTime.now().difference(_recordingStartTime!);
          });
        }
      });
    } catch (e) {
      debugPrint('Error starting recording: $e');
    }
  }

  Future<void> _cancelRecording() async {
    if (!_isRecording) return;
    
    _recordingTimer?.cancel();
    final path = await _audioRecorder.stop();
    
    setState(() {
      _isRecording = false;
    });

    HapticFeedback.mediumImpact();
    AppToast.show(context, 'Đã hủy ghi âm');
    if (path != null) {
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }
    }
  }

  Future<void> _stopAndSendRecording() async {
    if (!_isRecording) return;
    
    _recordingTimer?.cancel();
    final path = await _audioRecorder.stop();
    
    setState(() {
      _isRecording = false;
    });

    if (path != null) {
      final durationInSeconds = _recordingDuration.inSeconds;
      if (durationInSeconds < 1) {
        AppToast.show(context, 'Thời lượng ghi âm quá ngắn');
        final file = File(path);
        if (await file.exists()) {
          await file.delete();
        }
        return;
      }
      
      HapticFeedback.lightImpact();
      await _sendVoiceMessage(path);
    }
  }

  Future<void> _sendVoiceMessage(String path) async {
    await _controller.sendVoiceMessage(path);
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
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
            color: cs.surface,
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Text(
            formatted,
            style: TextStyle(
              fontSize: 11.sp,
              color: cs.onSurface,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

class _MessageImageGrid extends StatelessWidget {
  final List<dynamic> imageUrls;

  const _MessageImageGrid({required this.imageUrls});

  @override
  Widget build(BuildContext context) {
    final count = imageUrls.length;
    if (count == 1) {
      return _buildSingleImage(context, imageUrls.first.toString(), 0, isSingle: true);
    } else if (count == 2) {
      return SizedBox(
        width: 200.w,
        child: Row(
          children: [
            Expanded(child: _buildSingleImage(context, imageUrls[0].toString(), 0, height: 120.h)),
            SizedBox(width: 4.w),
            Expanded(child: _buildSingleImage(context, imageUrls[1].toString(), 1, height: 120.h)),
          ],
        ),
      );
    } else {
      return SizedBox(
        width: 200.w,
        child: GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 4.w,
            mainAxisSpacing: 4.h,
            childAspectRatio: 1.0,
          ),
          itemCount: count > 4 ? 4 : count,
          itemBuilder: (context, idx) {
            if (idx == 3 && count > 4) {
              return Stack(
                fit: StackFit.expand,
                children: [
                  _buildSingleImage(context, imageUrls[idx].toString(), idx),
                  GestureDetector(
                    onTap: () => _openGallery(context, idx),
                    child: Container(
                      color: Colors.black.withValues(alpha: 0.5),
                      child: Center(
                        child: Text(
                          '+${count - 3}',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            }
            return _buildSingleImage(context, imageUrls[idx].toString(), idx);
          },
        ),
      );
    }
  }

  void _openGallery(BuildContext context, int initialIndex) {
    showDialog(
      context: context,
      builder: (context) => _GalleryDialog(
        imageUrls: imageUrls.map((e) => e.toString()).toList(),
        initialIndex: initialIndex,
      ),
    );
  }

  Widget _buildSingleImage(BuildContext context, String url, int index, {double? height, bool isSingle = false}) {
    return GestureDetector(
      onTap: () => _openGallery(context, index),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(isSingle ? 18.r : 8.r),
        child: Image.network(
          url,
          fit: BoxFit.cover,
          width: isSingle ? 200.w : null,
          height: height,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return Container(
              width: isSingle ? 200.w : null,
              height: height ?? 150.h,
              color: Colors.grey[300],
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            );
          },
          errorBuilder: (context, error, stackTrace) {
            return Container(
              width: isSingle ? 200.w : null,
              height: height ?? 150.h,
              color: Colors.grey[300],
              child: const Center(
                child: Icon(Icons.broken_image_outlined, color: Colors.red),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _GalleryDialog extends StatefulWidget {
  final List<String> imageUrls;
  final int initialIndex;

  const _GalleryDialog({required this.imageUrls, required this.initialIndex});

  @override
  State<_GalleryDialog> createState() => _GalleryDialogState();
}

class _GalleryDialogState extends State<_GalleryDialog> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog.fullscreen(
      backgroundColor: Colors.black,
      child: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: widget.imageUrls.length,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemBuilder: (context, index) {
              return InteractiveViewer(
                minScale: 1.0,
                maxScale: 4.0,
                child: Center(
                  child: Image.network(
                    widget.imageUrls[index],
                    fit: BoxFit.contain,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      );
                    },
                  ),
                ),
              );
            },
          ),
          Positioned(
            top: 20.h,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Center(
                child: Text(
                  '${_currentIndex + 1} / ${widget.imageUrls.length}',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w500,
                    shadows: const [
                      Shadow(
                        color: Colors.black,
                        blurRadius: 4,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            top: 20.h,
            right: 16.w,
            child: SafeArea(
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 28),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AudioMessageBubble extends StatefulWidget {
  final String audioUrl;
  final bool isMe;

  const _AudioMessageBubble({required this.audioUrl, required this.isMe});

  @override
  State<_AudioMessageBubble> createState() => _AudioMessageBubbleState();
}

class _AudioMessageBubbleState extends State<_AudioMessageBubble> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  StreamSubscription? _durationSubscription;
  StreamSubscription? _positionSubscription;
  StreamSubscription? _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _durationSubscription = _audioPlayer.onDurationChanged.listen((d) {
      if (mounted) setState(() => _duration = d);
    });
    _positionSubscription = _audioPlayer.onPositionChanged.listen((p) {
      if (mounted) setState(() => _position = p);
    });
    _playerStateSubscription = _audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });
  }

  @override
  void dispose() {
    _durationSubscription?.cancel();
    _positionSubscription?.cancel();
    _playerStateSubscription?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _togglePlay() async {
    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
      } else {
        await _audioPlayer.play(UrlSource(widget.audioUrl));
      }
    } catch (e) {
      debugPrint('Error playing audio: $e');
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final textColor = widget.isMe ? Colors.white : Colors.black;
    final progressColor = widget.isMe ? Colors.white70 : Colors.black54;
    final displayDuration = _duration == Duration.zero ? '...' : _formatDuration(_duration);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          constraints: const BoxConstraints(),
          padding: EdgeInsets.zero,
          icon: Icon(
            _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
            color: textColor,
            size: 32.sp,
          ),
          onPressed: _togglePlay,
        ),
        SizedBox(width: 8.w),
        SizedBox(
          width: 80.w,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4.r),
            child: LinearProgressIndicator(
              value: _duration.inMilliseconds > 0 
                  ? _position.inMilliseconds / _duration.inMilliseconds 
                  : 0.0,
              backgroundColor: progressColor.withValues(alpha: 0.2),
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
              minHeight: 4.h,
            ),
          ),
        ),
        SizedBox(width: 8.w),
        Text(
          _formatDuration(_position) + ' / ' + displayDuration,
          style: TextStyle(
            color: textColor,
            fontSize: 10.sp,
          ),
        ),
      ],
    );
  }
}

class _RecordingDot extends StatefulWidget {
  @override
  State<_RecordingDot> createState() => _RecordingDotState();
}

class _RecordingDotState extends State<_RecordingDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Container(
        width: 8.w,
        height: 8.w,
        decoration: const BoxDecoration(
          color: Colors.red,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}