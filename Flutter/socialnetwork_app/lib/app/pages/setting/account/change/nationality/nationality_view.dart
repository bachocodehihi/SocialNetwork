import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/add/nationality/nationality_controller.dart';
import 'package:socialnetwork/app/widgets/banner/error.dart';
import 'package:socialnetwork/domain/usecases/account_usecase.dart';
import 'package:socialnetwork/data/repositories/account_repository_imp.dart';
import 'package:socialnetwork/data/network/api/account_api.dart';
import 'package:socialnetwork/data/network/dio_client.dart';
import 'package:country_picker/country_picker.dart';
import 'package:socialnetwork/app/widgets/dropdown/nation.dart';

class ChangeNationalityView extends StatefulWidget {
  const ChangeNationalityView({super.key});

  @override
  State<ChangeNationalityView> createState() => _ChangeNationalityViewState();
}

class _ChangeNationalityViewState extends State<ChangeNationalityView>
    with SingleTickerProviderStateMixin {
  late AddNationalityController controller;

  OverlayEntry? _overlayEntry;
  final LayerLink _layerLink = LayerLink();
  bool _isDropdownOpen = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  List<Country> _countries = [];

  @override
  void initState() {
    super.initState();
    controller = AddNationalityController(
      AccountUsecase(
        AccountRepositoryImp(
          AccountApi(DioClient.createDio()),
        ),
      ),
    );
    controller.addListener(() => setState(() {}));
    _countries = CountryService().getAll();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _removeOverlay();
    _animController.dispose();
    controller.dispose();
    super.dispose();
  }

  void _showDropdown() {
    _isDropdownOpen = true;
    _overlayEntry = _createOverlayEntry();
    Overlay.of(context).insert(_overlayEntry!);
    _animController.forward(from: 0);
    setState(() {});
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    _isDropdownOpen = false;
    if (mounted) setState(() {});
  }

  void _toggleDropdown() {
    if (_isDropdownOpen) {
      _removeOverlay();
    } else {
      _showDropdown();
    }
  }

  void _selectCountry(Country country) {
    controller.selectCountry(
      code: country.countryCode,
      name: country.name,
    );
    _removeOverlay();
  }

  OverlayEntry _createOverlayEntry() {
    final renderBox = context.findRenderObject() as RenderBox;
    final fieldWidth = renderBox.size.width - (kIsWeb ? 0 : 48.w);

    return OverlayEntry(
      builder: (_) => GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: _removeOverlay,
        child: Stack(
          children: [
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: Offset(0, 54.h),
              child: GestureDetector(
                onTap: () {},
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: DropdownNation(
                    width: fieldWidth,
                    countries: _countries,
                    selectedCode: controller.selectedCountryCode,
                    onSelect: _selectCountry,
                  ),
                ),
              ),
            ),
          ],
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

    return Scaffold(
      backgroundColor: cs.surface,
      body: SafeArea(
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
                    'Change nationality',
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
                'Select your nationality',
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ),

              SizedBox(height: 40.h),

              CompositedTransformTarget(
                link: _layerLink,
                child: TextFormField(
                  controller: controller.nationalityController,
                  style: TextStyle(fontSize: 15.sp, color: cs.onSurface),
                  readOnly: true,
                  onTap: _toggleDropdown,

                  decoration: InputDecoration(
                    labelText: 'Nationality',
                    labelStyle: TextStyle(fontSize: 15.sp, color: Colors.grey),
                    suffixIcon: AnimatedRotation(
                      turns: _isDropdownOpen ? 0.5 : 0,
                      duration: const Duration(milliseconds: 200),
                      child: Icon(
                        Icons.keyboard_arrow_down_outlined,
                        color: _isDropdownOpen ? Colors.blue : Colors.grey,
                        size: 20.sp,
                      ),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: const BorderSide(color: Colors.grey),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: const BorderSide(color: Colors.blue, width: 2),
                    ),
                    floatingLabelStyle: WidgetStateTextStyle.resolveWith(
                      (states) {
                        if (states.contains(WidgetState.focused)) {
                          return const TextStyle(color: Colors.blue);
                        }
                        return const TextStyle(color: Colors.grey);
                      },
                    ),
                  ),
                ),
              ),

              SizedBox(height: 20.h),

              SizedBox(
                height: 50.h,
                child: Visibility(
                  visible: controller.errorMessage.isNotEmpty,
                  maintainSize: true,
                  maintainAnimation: true,
                  maintainState: true,
                  child: BannerError(message: controller.errorMessage),
                ),
              ),

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
                  onPressed: controller.isLoading
                      ? null
                      : () => controller.addNationality(context),
                  child: controller.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Add',
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
      ),
    );
  }
}
