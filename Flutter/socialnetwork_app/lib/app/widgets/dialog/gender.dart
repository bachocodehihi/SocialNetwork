import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';

class GenderDialog extends StatefulWidget {
  final String? initialGender;
  final ValueChanged<String> onConfirm;

  const GenderDialog({
    super.key,
    this.initialGender,
    required this.onConfirm,
  });

  @override
  State<GenderDialog> createState() => _GenderDialogState();
}

class _GenderDialogState extends State<GenderDialog> {
  String? selectedGender;

  @override
  void initState() {
    super.initState();
    selectedGender = widget.initialGender;
  }

  void _onConfirm() {
    if (selectedGender == null) return;
    widget.onConfirm(selectedGender!);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Dialog(
      backgroundColor: cs.surface,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 0 : 24.w,
          vertical: 24.h,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Select gender',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.w500,
                color: cs.onSurface,
              ),
            ),
            SizedBox(height: 20.h),
            _radioItem('Male'),
            _radioItem('Female'),
            SizedBox(height: 20.h),
            MouseRegion(
              cursor: SystemMouseCursors.click,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.black,
                  minimumSize: Size(double.infinity, 48.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30.r),
                  ),
                ).copyWith(
                  overlayColor: WidgetStateProperty.all(Colors.grey[300]),
                ),
                onPressed: _onConfirm,
                child: Text(
                  'Continue',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 15.sp,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _radioItem(String value) {
    final bool isSelected = selectedGender == value;
    final cs = Theme.of(context).colorScheme;
    final bool isMale = value == 'Male';
    final Color accentColor = isMale ? Colors.blue : Colors.pink;

    return GestureDetector(
      onTap: () => setState(() => selectedGender = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: EdgeInsets.symmetric(vertical: 6.h),
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        decoration: BoxDecoration(
          color: isSelected ? accentColor.withValues(alpha: 0.08) : cs.surface,
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: isSelected ? accentColor : Colors.grey.withValues(alpha: 0.3),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                color: isSelected ? accentColor.withValues(alpha: 0.15) : Colors.grey.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isMale ? Icons.male_outlined : Icons.female_outlined,
                size: 20.sp,
                color: isSelected ? accentColor : Colors.grey,
              ),
            ),
            SizedBox(width: 10.w),

            Expanded(
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 15.sp,
                  fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                  color: isSelected ? accentColor : cs.onSurface,
                ),
              ),
            ),

            RadioGroup<String>(
              groupValue: selectedGender,
              onChanged: (v) => setState(() => selectedGender = v),
              child: Radio<String>(
                value: value,
                splashRadius: 0,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                fillColor: WidgetStateProperty.resolveWith<Color>((states) {
                  if (states.contains(WidgetState.selected)) return accentColor;
                  return Colors.grey;
                }),
                overlayColor: WidgetStateProperty.all(Colors.transparent),
              ),
            ),
          ],
        ),
      ),
    );
  }
}