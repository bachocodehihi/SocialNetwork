class FriendItem {
  final String id;
  final String username;
  final String? avatar;
  bool isSelected;

  FriendItem({
    required this.id,
    required this.username,
    this.avatar,
    this.isSelected = false,
  });

  factory FriendItem.fromJson(Map<String, dynamic> json) {
    return FriendItem(
      id: json['_id'] ?? json['id'] ?? '',
      username: json['username'] ?? 'Unknown',
      avatar: json['avatar'],
      isSelected: false,
    );
  }
}