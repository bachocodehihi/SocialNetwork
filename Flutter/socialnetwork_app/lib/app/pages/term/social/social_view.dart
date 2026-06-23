import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:socialnetwork/app/theme/app_terms_data.dart';
import 'package:socialnetwork/app/providers/app_provider.dart';

class TermSocialView extends StatefulWidget {
  const TermSocialView({super.key});

  @override
  State<TermSocialView> createState() => _TermSocialViewState();
}

class _TermSocialViewState extends State<TermSocialView> {
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
    final appProvider = Provider.of<AppProvider>(context);
    final isEn = appProvider.locale.languageCode == 'en';

    final highlights = AppTermsData.getSocialHighlights(isEn);
    final allArticles = AppTermsData.getSocialArticles(isEn);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: cs.surface,
        appBar: AppBar(
          backgroundColor: cs.surface,
          elevation: 0,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios_outlined,
              size: 20.sp,
              color: cs.onSurface,
            ),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            isEn ? 'Social Terms of Service' : 'Điều khoản Mạng xã hội',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface,
            ),
          ),
          centerTitle: true,
          bottom: TabBar(
            labelColor: Colors.blue,
            unselectedLabelColor: cs.onSurface.withValues(alpha: 0.6),
            indicatorColor: Colors.blue,
            indicatorSize: TabBarIndicatorSize.tab,
            labelStyle: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w500,
            ),
            tabs: [
              Tab(
                text: isEn ? 'Overview' : 'Tóm tắt',
              ),
              Tab(
                text: isEn ? 'Full Terms' : 'Chi tiết',
              ),
            ],
          ),
        ),
        body: SafeArea(
          child: TabBarView(
            children: [
              _buildOverviewTab(context, cs, isEn, highlights),

              _buildFullTermsTab(context, cs, isEn, allArticles),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOverviewTab(
    BuildContext context,
    ColorScheme cs,
    bool isEn,
    List<TermHighlight> highlights,
  ) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.symmetric(
        horizontal: kIsWeb ? 20.w : 16.w,
        vertical: 16.h,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isEn ? 'Social Standards Summary' : 'Chuẩn mực cộng đồng',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w500,
              color: cs.onSurface,
            ),
          ),
          SizedBox(height: 12.h),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: highlights.length,
            separatorBuilder: (context, index) => SizedBox(height: 12.h),
            itemBuilder: (context, index) {
              final highlight = highlights[index];
              return Container(
                padding: EdgeInsets.all(16.r),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(
                    color: cs.outline.withValues(alpha: 0.1),
                    width: 1.r,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6.r,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: EdgeInsets.all(10.r),
                      decoration: BoxDecoration(
                        color: highlight.color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      child: Icon(
                        highlight.icon,
                        color: highlight.color,
                        size: 24.sp,
                      ),
                    ),
                    SizedBox(width: 14.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            highlight.title,
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w500,
                              color: cs.onSurface,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            highlight.description,
                            textAlign: TextAlign.justify,
                            style: TextStyle(
                              fontSize: 13.sp,
                              color: cs.onSurface.withValues(alpha: 0.7),
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _buildFullTermsTab(
    BuildContext context,
    ColorScheme cs,
    bool isEn,
    List<TermArticle> articles,
  ) {
    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
      itemCount: articles.length,
      itemBuilder: (context, index) {
        final article = articles[index];
        return Card(
          elevation: 0,
          margin: EdgeInsets.only(bottom: 12.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
            side: BorderSide(
              color: cs.outline.withValues(alpha: 0.12),
              width: 1.r,
            ),
          ),
          color: cs.surface,
          child: Theme(
            data: Theme.of(context).copyWith(
              dividerColor: Colors.transparent,
            ),
            child: ExpansionTile(
              iconColor: Colors.blue,
              collapsedIconColor: cs.onSurface.withValues(alpha: 0.6),
              title: Text(
                article.title,
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),
              childrenPadding: EdgeInsets.only(
                left: 16.w,
                right: 16.w,
                bottom: 16.h,
              ),
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: article.paragraphs.map((p) {
                    return Padding(
                      padding: EdgeInsets.only(bottom: 8.h),
                      child: SizedBox(
                        width: double.infinity,
                        child: Text(
                          p,
                          textAlign: TextAlign.justify,
                          style: TextStyle(
                            fontSize: 13.sp,
                            color: cs.onSurface.withValues(alpha: 0.8),
                            height: 1.45,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

