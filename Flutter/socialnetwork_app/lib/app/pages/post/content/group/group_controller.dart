import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:socialnetwork/data/network/api/content_api.dart';
import 'package:socialnetwork/data/repositories/content_repository_imp.dart';
import 'package:socialnetwork/domain/usecases/content_usecase.dart';
import 'package:socialnetwork/data/network/dio_client.dart';

class GroupPostContentController extends ChangeNotifier {
  final String groupId;
  final ContentUsecase _contentUsecase;

  final TextEditingController contentController = TextEditingController();
  List<XFile> pickedImages = [];

  bool isSubmitting = false;
  String errorMessage = '';

  GroupPostContentController({
    required this.groupId,
    ContentUsecase? contentUsecase,
  }) : _contentUsecase = contentUsecase ??
            ContentUsecase(
              ContentRepositoryImp(
                ContentApi(DioClient.createDio()),
              ),
            );

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
      await _contentUsecase.createPost(
        content: contentController.text.trim(),
        postType: 'group',
        groupId: groupId,
        imagePaths: imagePaths,
      );

      if (context.mounted) {
        Navigator.pop(context, true); // Returns true to trigger feed refresh
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
