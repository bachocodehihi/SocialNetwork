import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';
import 'package:socialnetwork/data/network/api/group_api.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/data/repositories/group_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/domain/usecases/group_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class PostContentController extends ChangeNotifier {
  final ContentUsecase _contentUsecase;
  final GroupUsecase _groupUsecase;

  final TextEditingController contentController = TextEditingController();

  String postType = 'user'; // 'user' or 'group'
  Map<String, dynamic>? selectedGroup;
  List<Map<String, dynamic>> myGroups = [];
  List<XFile> pickedImages = [];
  String privacy = 'public'; // 'public', 'friends', 'private'

  bool isLoadingGroups = false;
  bool isSubmitting = false;
  String errorMessage = '';

  PostContentController({ContentUsecase? contentUsecase, GroupUsecase? groupUsecase})
      : _contentUsecase = contentUsecase ??
            ContentUsecase(
              ContentRepositoryImp(
                ContentApi(DioClient.createDio()),
              ),
            ),
        _groupUsecase = groupUsecase ??
            GroupUsecase(
              GroupRepositoryImp(
                GroupApi(DioClient.createDio()),
              ),
            ) {
    loadGroups();
  }

  Future<void> loadGroups() async {
    isLoadingGroups = true;
    errorMessage = '';
    notifyListeners();
    try {
      myGroups = await _groupUsecase.getGroups();
      if (myGroups.isNotEmpty) {
        selectedGroup = myGroups.first;
      }
    } catch (e) {
      errorMessage = 'Không thể tải danh sách nhóm';
    } finally {
      isLoadingGroups = false;
      notifyListeners();
    }
  }

  void setPostType(String type) {
    postType = type;
    notifyListeners();
  }

  void setPrivacy(String newPrivacy) {
    privacy = newPrivacy;
    notifyListeners();
  }

  void setSelectedGroup(Map<String, dynamic>? group) {
    selectedGroup = group;
    notifyListeners();
  }

  Future<void> pickImages() async {
    try {
      final picker = ImagePicker();
      final List<XFile> images = await picker.pickMultiImage(
        imageQuality: 85,
      );
      if (images.isNotEmpty) {
        pickedImages.addAll(images);
        notifyListeners();
      }
    } catch (e) {
      errorMessage = 'Không thể chọn ảnh';
      notifyListeners();
    }
  }

  void removeImage(int index) {
    pickedImages.removeAt(index);
    notifyListeners();
  }

  Future<void> submitPost(BuildContext context) async {
    if (contentController.text.trim().isEmpty && pickedImages.isEmpty) {
      errorMessage = 'Vui lòng nhập nội dung hoặc chọn ảnh';
      notifyListeners();
      return;
    }

    isSubmitting = true;
    errorMessage = '';
    notifyListeners();

    try {
      final imagePaths = pickedImages.map((file) => file.path).toList();
      String? groupId;
      if (postType == 'group') {
        groupId = selectedGroup?['_id']?.toString();
      }
      await _contentUsecase.createPost(
        content: contentController.text.trim(),
        postType: postType,
        privacy: postType == 'user' ? privacy : null,
        groupId: groupId,
        imagePaths: imagePaths,
      );

      if (context.mounted) {
        Navigator.pop(context, true); // Returns true to notify main screen to refresh feed
      }
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      isSubmitting = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    contentController.dispose();
    super.dispose();
  }
}
