import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:socialnetwork/app/pages/scanner/scanner_controller.dart';
import 'package:socialnetwork/app/pages/user/user_page.dart';
import 'package:socialnetwork/app/widgets/dialog/signin/signin_view.dart';

class ScannerView extends StatefulWidget {
  const ScannerView({super.key});

  @override
  State<ScannerView> createState() => _ScannerViewState();
}

class _ScannerViewState extends State<ScannerView> {
  late ScannerController controller;
  late MobileScannerController _scannerController;

  @override
  void initState() {
    super.initState();
    controller = ScannerController();
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (!controller.isScanning) return;

    final barcode = capture.barcodes.firstOrNull;
    if (barcode == null || barcode.rawValue == null) return;

    final qrValue = barcode.rawValue!;

    controller.pauseScanning();
    _scannerController.stop();

    // Check if it's a QR code sign-in session
    try {
      final decodedJson = jsonDecode(qrValue);
      if (decodedJson is Map &&
          decodedJson['type'] == 'login' &&
          decodedJson['sessionId'] != null) {
        final sessionId = decodedJson['sessionId'] as String;
        
        if (!mounted) return;
        
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => SignInWebsiteDialog(
            sessionId: sessionId,
            onCancel: () {
              // Dialog closed, scanning will resume
            },
            onSuccess: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Đăng nhập thành công trên Web!'),
                  backgroundColor: Colors.green,
                ),
              );
            },
          ),
        );
        
        _scannerController.start();
        controller.resumeScanning();
        return;
      }
    } catch (_) {
      // Not a QR Login JSON, proceed to original flow
    }

    final userData = await controller.fetchUserByQrCode(qrValue);

    if (!mounted) return;

    if (userData != null) {

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => UserPage(userData: userData),
        ),
      );
      
      _scannerController.start();
      controller.resumeScanning();
    } else {
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(controller.errorMessage ?? 'Mã QR không hợp lệ'),
            backgroundColor: Colors.red,
          ),
        );
        _scannerController.start();
        controller.resumeScanning();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
          ),

          _buildScanOverlay(),

          SafeArea(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [

                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: EdgeInsets.all(8.r),
                      decoration: BoxDecoration(
                        color: Colors.black38,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_outlined,
                        color: Colors.white,
                        size: 20.sp,
                      ),
                    ),
                  ),

                  Text(
                    'Scanner QR',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  
                  ListenableBuilder(
                    listenable: controller,
                    builder: (_, _) => GestureDetector(
                      onTap: () {
                        _scannerController.toggleTorch();
                        controller.toggleFlash();
                      },
                      child: Container(
                        padding: EdgeInsets.all(8.r),
                        decoration: BoxDecoration(
                          color: Colors.black38,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          controller.isFlashOn
                              ? Icons.flash_on_outlined
                              : Icons.flash_off_outlined,
                          color: controller.isFlashOn
                              ? Colors.yellow
                              : Colors.white,
                          size: 20.sp,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          ListenableBuilder(
            listenable: controller,
            builder: (_, _) {
              if (!controller.isLoading) return const SizedBox.shrink();
              return Container(
                color: Colors.black54,
                child: const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
              );
            },
          ),
          
          Positioned(
            bottom: 80.h,
            left: 0,
            right: 0,
            child: Text(
              'Đưa mã QR vào khung để quét',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey,
                fontSize: 13.sp,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanOverlay() {
    final screenSize = MediaQuery.of(context).size;
    final scanBoxSize = screenSize.width * 0.65;
    final cornerSize = 28.0;
    final cornerThickness = 4.0;
    final cornerColor = Colors.white;

    return Stack(
      children: [
        
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withValues(alpha: 0.55),
            BlendMode.srcOut,
          ),
          child: Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.black,
                  backgroundBlendMode: BlendMode.dstOut,
                ),
              ),
              Center(
                child: Container(
                  width: scanBoxSize,
                  height: scanBoxSize,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                  ),
                ),
              ),
            ],
          ),
        ),
        
        Center(
          child: SizedBox(
            width: scanBoxSize,
            height: scanBoxSize,
            child: Stack(
              children: [
                Positioned(
                  top: 0,
                  left: 0,
                  child: _corner(
                    top: true,
                    left: true,
                    size: cornerSize,
                    thickness: cornerThickness,
                    color: cornerColor,
                  ),
                ),
                
                Positioned(
                  top: 0,
                  right: 0,
                  child: _corner(
                    top: true,
                    left: false,
                    size: cornerSize,
                    thickness: cornerThickness,
                    color: cornerColor,
                  ),
                ),
                
                Positioned(
                  bottom: 0,
                  left: 0,
                  child: _corner(
                    top: false,
                    left: true,
                    size: cornerSize,
                    thickness: cornerThickness,
                    color: cornerColor,
                  ),
                ),
                
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: _corner(
                    top: false,
                    left: false,
                    size: cornerSize,
                    thickness: cornerThickness,
                    color: cornerColor,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _corner({
    required bool top,
    required bool left,
    required double size,
    required double thickness,
    required Color color,
  }) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _CornerPainter(
          top: top,
          left: left,
          thickness: thickness,
          color: color,
        ),
      ),
    );
  }
}

class _CornerPainter extends CustomPainter {
  final bool top;
  final bool left;
  final double thickness;
  final Color color;

  _CornerPainter({
    required this.top,
    required this.left,
    required this.thickness,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = thickness
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final w = size.width;
    final h = size.height;

    if (top && left) {
      path.moveTo(0, h);
      path.lineTo(0, 0);
      path.lineTo(w, 0);
    } else if (top && !left) {
      path.moveTo(0, 0);
      path.lineTo(w, 0);
      path.lineTo(w, h);
    } else if (!top && left) {
      path.moveTo(0, 0);
      path.lineTo(0, h);
      path.lineTo(w, h);
    } else {
      path.moveTo(w, 0);
      path.lineTo(w, h);
      path.lineTo(0, h);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_CornerPainter old) => false;
}