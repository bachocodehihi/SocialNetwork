import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/widgets/toast/toast.dart';
import 'package:socialnetwork/app/pages/qrcode/qrcode_controller.dart';
//import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:gal/gal.dart';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/rendering.dart';
import 'package:socialnetwork/app/routes/routes.dart';
class QRCodeView extends StatefulWidget {
  const QRCodeView({super.key});
  @override
  State<QRCodeView> createState() => _QRCodeViewState();
}

class _QRCodeViewState extends State<QRCodeView> {
  late QRCodeController controller;
  bool _isSaving = false;
  final GlobalKey _globalKey = GlobalKey();

  Future<void> _downloadQRCode(String username) async {
    if (_isSaving) return;
    setState(() {
      _isSaving = true;
    });

    try {
      final hasAccess = await Gal.hasAccess(toAlbum: true);
      if (!hasAccess) {
        final granted = await Gal.requestAccess(toAlbum: true);
        if (!granted) {
          if (mounted) {
            AppToast.show(context, Language.of(context, 'permission_denied'));
          }
          setState(() {
            _isSaving = false;
          });
          return;
        }
      }

      final boundary = _globalKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) {
        throw Exception('Could not find render object');
      }

      final image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) {
        throw Exception('Failed to get byte data from image');
      }
      final pngBytes = byteData.buffer.asUint8List();

      final tempDir = await getTemporaryDirectory();
      final tempPath = '${tempDir.path}/${username}_qr_card.png';
      final file = File(tempPath);
      await file.writeAsBytes(pngBytes);

      await Gal.putImage(tempPath);

      if (mounted) {
        AppToast.show(context, Language.of(context, 'save_success'));
      }
    } catch (e) {
      if (mounted) {
        AppToast.show(context, '${Language.of(context, 'save_failed')}$e');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    controller = QRCodeController();
    controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void showCodeDialog() {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        child: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 275.w,
                  height: 275.h,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage(controller.qrCode!),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                SizedBox(height: 10.h),
                Text(
                  controller.username!,
                  style: TextStyle(
                    fontSize: 20.sp,
                    color: Colors.black,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness:
            brightness == Brightness.dark ? Brightness.light : Brightness.dark,
      ),
    );
    final cs = Theme.of(context).colorScheme;
    final hasData = controller.qrCode != null && controller.username != null;

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: kIsWeb ? 0 : 24.w,
              vertical: 16.h,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
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
                    Text(
                      Language.of(context, 'qr_code'),
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 80.h),

                if (!hasData)
                  Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40.h),
                      child: const CircularProgressIndicator(),
                    ),
                  )
                else ...[
                  RepaintBoundary(
                    key: _globalKey,
                    child: Container(
                      color: cs.surface,
                      padding: EdgeInsets.symmetric(vertical: 24.h),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Center(
                            child: GestureDetector(
                              onTap: showCodeDialog,
                              child: Container(
                                width: 200.w,
                                height: 200.h,
                                decoration: BoxDecoration(
                                  image: DecorationImage(
                                    image: NetworkImage(controller.qrCode!),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          SizedBox(height: 20.h),
                          Text(
                            controller.username!,
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w500,
                              color: cs.onSurface,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  SizedBox(height: 40.h),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _isSaving
                          ? Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 56.r,
                                  height: 56.r,
                                  alignment: Alignment.center,
                                  child: SizedBox(
                                    width: 24.w,
                                    height: 24.h,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.r,
                                      color: cs.onSurface,
                                    ),
                                  ),
                                ),
                                
                                SizedBox(height: 8.h),

                                Text(
                                  Language.of(context, 'saving'),
                                  style: TextStyle(
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.w500,
                                    color: cs.onSurface.withValues(alpha: 0.5),
                                  ),
                                ),
                              ],
                            )
                          : _buildActionButton(
                              context,
                              icon: Icons.download_outlined,
                              label: Language.of(context, 'download'),
                              onTap: () => _downloadQRCode(controller.username!),
                              cs: cs,
                            ),
                      SizedBox(width: 48.w),
                      _buildActionButton(
                        context,
                        icon: Icons.share_outlined,
                        label: Language.of(context, 'share'),
                        onTap: () {
                          Navigator.pushNamed(context, Routes.share);
                        },
                        cs: cs,
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required ColorScheme cs,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56.r,
            height: 56.r,
            decoration: BoxDecoration(
              color: cs.outline.withValues(alpha: 0.06),
              shape: BoxShape.circle,
              border: Border.all(
                color: cs.outline.withValues(alpha: 0.12),
                width: 1.r,
              ),
            ),
            child: Icon(
              icon,
              color: cs.onSurface,
              size: 24.sp,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            label,
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }
}


