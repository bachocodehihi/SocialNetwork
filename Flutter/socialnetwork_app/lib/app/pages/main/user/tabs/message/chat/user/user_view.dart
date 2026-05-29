import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import 'user_controller.dart';
import 'package:socialnetwork/data/service/call.dart';
import 'package:socialnetwork/app/routes/routes.dart';

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
 
  @override
  void initState() {
    super.initState();
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
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        backgroundColor: cs.surface,
        elevation: 0.5,
        scrolledUnderElevation: 2,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_outlined, size: 20, color: cs.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
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
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.receiverName,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
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
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.phone_outlined, color: cs.onSurfaceVariant),
            onPressed: () async {
              final conversationId = _controller.conversationId;
              if (conversationId == null) return;
              
              await CallService().startCall(
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
          ),
          IconButton(
            icon: Icon(Icons.videocam_outlined, color: cs.onSurfaceVariant),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.more_vert_outlined, color: cs.onSurfaceVariant),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(child: _buildMessagesList(cs)),
          _buildInputBar(cs),
        ],
      ),
    );
  }
 
  Widget _buildMessagesList(ColorScheme cs) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        if (_controller.isLoading && _controller.messages.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        if (_controller.error != null) {
          return Center(
              child: Text('${_controller.error}',
                  style: TextStyle(color: cs.error)));
        }
        if (_controller.messages.isEmpty) {
          return Center(
              child: Text('No messages yet',
                  style: TextStyle(color: cs.onSurfaceVariant)));
        }
 
        return ListView.builder(
          controller: _scrollController,
          padding: EdgeInsets.symmetric(
              horizontal: kIsWeb ? 0 : 16.w, vertical: 12.h),
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
                                      ? Icon(Icons.person_outline,
                                          size: 16, color: cs.onPrimaryContainer)
                                      : null,
                                )
                              : SizedBox(width: 28.w),
                          SizedBox(width: 8.w),
                        ],
                        ConstrainedBox(
                          constraints: BoxConstraints(maxWidth: 0.65.sw),
                          child: Column(
                            crossAxisAlignment: isMe
                                ? CrossAxisAlignment.end
                                : CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 14.w, vertical: 10.h),
                                decoration: BoxDecoration(
                                  color: isMe
                                      ? cs.primary
                                      : cs.surfaceContainerHighest,
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
                                      color: isMe ? cs.onPrimary : cs.onSurface,
                                      height: 1.4),
                                ),
                              ),
                              SizedBox(height: 3.h),
                              Text(
                                _formatTime(msg['createdAt']),
                                style: TextStyle(
                                    fontSize: 10.sp,
                                    color: cs.onSurfaceVariant
                                        .withValues(alpha: 0.7)),
                              ),
                            ],
                          ),
                        ),
                        if (isMe) SizedBox(width: 4.w),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }
 
  Widget _buildInputBar(ColorScheme cs) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 16.w, 
        vertical: 8.h
      ),
      decoration: BoxDecoration(
        color: cs.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            IconButton(
              icon: Icon(Icons.emoji_emotions_outlined, 
                  color: cs.onSurfaceVariant),
              onPressed: () {},
            ),
            
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
            
            SizedBox(width: 8.w),
            _controller.isSending
                ? const SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : GestureDetector(
                    onTap: _hasText ? _sendMessage : null,
                    child: CircleAvatar(
                      radius: 22.r,
                      backgroundColor: _hasText ? cs.primary : cs.surfaceContainerHighest,
                      child: Icon(
                        Icons.send_rounded,
                        color: _hasText ? cs.onPrimary : cs.onSurfaceVariant,
                        size: 20.sp,
                      ),
                    ),
                  ),
          ],
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