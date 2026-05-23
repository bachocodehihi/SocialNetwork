import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:socialnetwork/app/pages/game/game_controller.dart';
import 'package:socialnetwork/app/widgets/item/game.dart';
class GameView extends StatefulWidget {
  const GameView({super.key});
  @override
  State<GameView> createState() => _GameViewState();
}
class _GameViewState extends State<GameView> {

  late GameController controller;

  @override
  void initState() {
    super.initState();
    controller = GameController();
    controller.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: Icon(
                      Icons.arrow_back_ios_outlined, 
                      size: 20.sp,
                      color: cs.onSurface,
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Text(
                    'Game',
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
                'List game',
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w500,
                  color: cs.onSurface,
                ),
              ), 

              SizedBox(height: 20.h),

              GameItem(
                title: 'Tic tac toe', 
                icon: Image.asset(
                  'assets/icons/games/tictactoe.png',
                  width: 24.w,
                  height: 24.h,
                ),
                onTap: () {
                  controller.goToGameTictactoe(context);
                }
              ),

              SizedBox(height: 15.h),

              GameItem(
                title: 'Chess', 
                icon: Image.asset(
                  'assets/icons/games/chess.png',
                  width: 24.w,
                  height: 24.h,
                ),
                onTap: () {}
              ),
              
            ],    
          ),
        ),
      ),
    ); 
  }
}      
