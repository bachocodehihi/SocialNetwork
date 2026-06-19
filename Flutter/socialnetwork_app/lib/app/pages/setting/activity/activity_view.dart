import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/widgets/card/today_card.dart';
import 'package:socialnetwork/app/widgets/chart/week_chart.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/pages/setting/activity/activity_controller.dart';
import 'package:socialnetwork/app/theme/app_translation.dart';
class SettingActivityView extends StatefulWidget {
  const SettingActivityView({super.key});

  @override
  State<SettingActivityView> createState() => _SettingActivityViewState();
}

class _SettingActivityViewState extends State<SettingActivityView> {
  static const List<String> _weekDayLabels = [
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  ];

  int get _todayIndex => DateTime.now().weekday - 1;

  List<String> get _dynamicLabels => _weekDayLabels;

  static String _formatDuration(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    if (h > 0 && m > 0) return '${h}h ${m}m';
    if (h > 0) return '${h}h';
    return '${m}m';
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
    final controller = Provider.of<ActivityController>(context);

    if (controller.isLoading) {
      return Scaffold(
        backgroundColor: cs.surface,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final todayMinutes = controller.weekDayMinutes[_todayIndex];
    final totalWeekMinutes = controller.totalMinutes;

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: controller.fetchActivity,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
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
                        Language.of(context, 'activity'),
                        style: TextStyle(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w500,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  TodayCard(
                    dayLabel: _dynamicLabels[_todayIndex],
                    minutes: todayMinutes,
                  ),

                  SizedBox(height: 20.h),

                  Text(
                    Language.of(context, 'this_week'),
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                      color: cs.onSurface,
                    ),
                  ),

                  SizedBox(height: 5.h),

                  Row(
                    children: [
                      Text(
                        Language.of(context, 'total'),
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                      Text(
                        ' ${_formatDuration(totalWeekMinutes)}',
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  WeekChart(
                    values: controller.weekDayMinutes,
                    labels: _dynamicLabels,
                    todayIndex: _todayIndex,
                    maxBarHeight: 300.h,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}