import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:country_picker/country_picker.dart';

class DropdownNation extends StatefulWidget {
  final double width;
  final List<Country> countries;
  final String selectedCode;
  final ValueChanged<Country> onSelect;

  const DropdownNation({
    super.key,
    required this.width,
    required this.countries,
    required this.selectedCode,
    required this.onSelect,
  });

  @override
  State<DropdownNation> createState() => _DropdownNationState();
}

class _DropdownNationState extends State<DropdownNation> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Material(
      color: Colors.transparent,
      child: Container(
        width: widget.width,
        constraints: BoxConstraints(maxHeight: 260.h),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(10.r),
          border: Border.all(color: cs.outlineVariant),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16.r,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10.r),
          child: Scrollbar(
            controller: _scrollController,
            thumbVisibility: true,
            child: ListView.separated(
              controller: _scrollController,
              padding: EdgeInsets.symmetric(vertical: 6.h),
              itemCount: widget.countries.length,
              separatorBuilder: (_, i) => Divider(
                height: 1,
                color: Colors.grey.shade200,
                indent: 14.w,
                endIndent: 14.w,
              ),
              itemBuilder: (context, index) {
                final country = widget.countries[index];
                final isSelected = country.countryCode == widget.selectedCode;

                return InkWell(
                  onTap: () => widget.onSelect(country),
                  splashColor: Colors.blue.shade50,
                  highlightColor: Colors.blue.shade50,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 14.w,
                      vertical: 13.h,
                    ),
                    color: isSelected ? Colors.blue.shade50 : null,
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            country.name,
                            style: TextStyle(
                              fontSize: 15.sp,
                              color: isSelected ? Colors.blue : cs.onSurface,
                              fontWeight: isSelected
                                  ? FontWeight.w500
                                  : FontWeight.normal,
                            ),
                          ),
                        ),
                        if (isSelected)
                          Icon(
                            Icons.check_rounded,
                            size: 20.sp,
                            color: Colors.blue,
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}