import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/providers/app_provider.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
import 'package:socialnetwork/app/pages/setting/language/language_controller.dart';

class SettingLanguageView extends StatefulWidget {
  const SettingLanguageView({super.key});

  @override
  State<SettingLanguageView> createState() => _SettingLanguageViewState();
}

class _SettingLanguageViewState extends State<SettingLanguageView> {
  final SettingLanguageController _controller = SettingLanguageController();

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final cs = Theme.of(context).colorScheme;
    final isDark = brightness == Brightness.dark;

    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
    );

    return Consumer<AppProvider>(
      builder: (context, appProvider, child) {
        final currentLanguageCode = appProvider.locale.languageCode;

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
                  crossAxisAlignment: CrossAxisAlignment.start,
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
                          Language.of(context, 'language'),
                          style: TextStyle(
                            fontSize: 20.sp,
                            fontWeight: FontWeight.w500,
                            color: cs.onSurface,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20.h),

                    Text(
                      Language.of(context, 'select_your_preferred_language'),
                      style: TextStyle(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w500,
                        color: cs.onSurface.withValues(alpha: 0.6),
                      ),
                    ),
                    SizedBox(height: 20.h),

                    _buildLanguageItem(
                      flag: '🇻🇳',
                      name: 'Tiếng Việt',
                      subName: '(Vietnamese)',
                      code: 'vi',
                      isSelected: currentLanguageCode == 'vi',
                      cs: cs,
                      isDark: isDark,
                    ),

                    SizedBox(height: 15.h),

                    _buildLanguageItem(
                      flag: '🇺🇸',
                      name: 'English',
                      subName: '(Tiếng Anh)',
                      code: 'en',
                      isSelected: currentLanguageCode == 'en',
                      cs: cs,
                      isDark: isDark,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLanguageItem({
    required String flag,
    required String name,
    required String subName,
    required String code,
    required bool isSelected,
    required ColorScheme cs,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: () => _controller.selectLanguage(context, code),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        padding: EdgeInsets.symmetric(horizontal: 18.w, vertical: 16.h),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16.r),
          color: isSelected
              ? cs.primary.withValues(alpha: isDark ? 0.15 : 0.08)
              : (isDark ? Colors.white.withValues(alpha: 0.04) : Colors.white),
          border: Border.all(
            color: isSelected
                ? cs.primary
                : (isDark ? Colors.white.withValues(alpha: 0.08) : Colors.grey.shade200),
            width: isSelected ? 1.8 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: cs.primary.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.01),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  )
                ],
        ),
        child: Row(
          children: [
            
            Container(
              alignment: Alignment.center,
              width: 44.w,
              height: 44.h,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey.shade50,
              ),
              child: Text(
                flag,
                style: TextStyle(fontSize: 25.sp), 
              ),
            ),

            SizedBox(width: 15.w),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: isSelected ? FontWeight.w500 : FontWeight.w500,
                      color: isSelected ? cs.primary : cs.onSurface,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    subName,
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface.withValues(alpha: 0.4),
                    ),
                  ),
                ],
              ),
            ),

            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              width: 22.sp,
              height: 22.sp,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? cs.primary : cs.onSurface.withValues(alpha: 0.2),
                  width: isSelected ? 6.5 : 2.0,
                ),
                color: Colors.transparent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}