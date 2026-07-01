import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/qrcode/group/group_view.dart';
class QRCodeGroupPage extends StatelessWidget {
  final String? groupId;
  const QRCodeGroupPage({super.key, this.groupId});
  @override
  Widget build(BuildContext context) {
    final String actualGroupId = groupId ?? ModalRoute.of(context)!.settings.arguments as String;
    return QRCodeGroupView(groupId: actualGroupId);
  }
}
