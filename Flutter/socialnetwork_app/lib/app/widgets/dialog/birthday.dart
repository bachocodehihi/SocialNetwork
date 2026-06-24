import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class BirthdayDialog extends StatefulWidget {
  final DateTime initialDate;
  final ValueChanged<DateTime> onConfirm;

  const BirthdayDialog({
    super.key,
    required this.initialDate,
    required this.onConfirm,
  });

  @override
  State<BirthdayDialog> createState() => _BirthdayDialogState();
}

class _BirthdayDialogState extends State<BirthdayDialog> {
  late int day;
  late int month;
  late int year;

  late List<String> days;
  late List<String> years;

  @override
  void initState() {
    super.initState();
    day = widget.initialDate.day;
    month = widget.initialDate.month;
    year = widget.initialDate.year;
    years = List.generate(200, (i) => (1900 + i).toString());
    _updateDays();
  }

  void _updateDays() {
    final maxDay = DateUtils.getDaysInMonth(year, month);
    days = List.generate(maxDay, (i) => (i + 1).toString().padLeft(2, '0'));
    if (day > maxDay) day = maxDay;
  }

  void _onConfirm() {
    widget.onConfirm(DateTime(year, month, day));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final List<String> months = [
      Language.of(context, 'jan'),
      Language.of(context, 'feb'),
      Language.of(context, 'mar'),
      Language.of(context, 'apr'),
      Language.of(context, 'may'),
      Language.of(context, 'jun'),
      Language.of(context, 'jul'),
      Language.of(context, 'aug'),
      Language.of(context, 'sep'),
      Language.of(context, 'oct'),
      Language.of(context, 'nov'),
      Language.of(context, 'dec'),
    ];

    return Dialog(
      backgroundColor: cs.surfaceContainerHigh,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: kIsWeb ? 0 : 24.w,
          vertical: 28.h,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              Language.of(context, 'select_your_birthday'),
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.w500,
                color: cs.onSurface,
              ),
            ),

            SizedBox(height: 20.h),

            Row(
              children: [
                Expanded(
                  child: Center(
                    child: Text(
                      Language.of(context, 'day'),
                      style: TextStyle(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Text(
                      Language.of(context, 'month'),
                      style: TextStyle(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Text(
                      Language.of(context, 'year'),
                      style: TextStyle(
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: 10.h),

            SizedBox(
              width: double.infinity,
              height: 160.h,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  IgnorePointer(
                    child: Center(
                      child: Container(
                        height: 44.h,
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                      ),
                    ),
                  ),

                  Row(
                    children: [
                      _wheel(
                        items: days,
                        index: day - 1,
                        onChanged: (i) => setState(() => day = i + 1),
                      ),
                      _wheel(
                        items: months,
                        index: month - 1,
                        onChanged: (i) => setState(() {
                          month = i + 1;
                          _updateDays();
                        }),
                      ),
                      _wheel(
                        items: years,
                        index: year - 1900,
                        onChanged: (i) => setState(() {
                          year = int.parse(years[i]);
                          _updateDays();
                        }),
                      ),
                    ],
                  ),

                  IgnorePointer(
                    child: Column(
                      children: [
                        Container(
                          height: 55.h,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                cs.surfaceContainerHigh,
                                cs.surfaceContainerHigh.withValues(alpha: 0),
                              ],
                            ),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          height: 55.h,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [
                                cs.surfaceContainerHigh,
                                cs.surfaceContainerHigh.withValues(alpha: 0),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 20.h),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.black,
                minimumSize: Size(double.infinity, 48.h),
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30.r),
                ),
              ).copyWith(
                overlayColor: WidgetStateProperty.all(Colors.grey[300]),
              ),
              onPressed: _onConfirm,
              child: Text(
                Language.of(context, 'continue'),
                style: TextStyle(
                  fontSize: 15.sp,
                  color: Colors.white
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _wheel({
    required List<String> items,
    required int index,
    required ValueChanged<int> onChanged,
  }) {
    final cs = Theme.of(context).colorScheme;
    return Expanded(
      child: ListWheelScrollView.useDelegate(
        itemExtent: 44.h,
        physics: const FixedExtentScrollPhysics(),
        perspective: 0.003,
        diameterRatio: 2.5,
        controller: FixedExtentScrollController(initialItem: index),
        onSelectedItemChanged: onChanged,
        childDelegate: ListWheelChildBuilderDelegate(
          childCount: items.length,
          builder: (_, i) => Center(
            child: Text(
              items[i],
              style: TextStyle(
                fontSize: 15.sp,
                fontWeight: FontWeight.w500,
                color: cs.onSurface,
              ),
            ),
          ),
        ),
      ),
    );
  }
}