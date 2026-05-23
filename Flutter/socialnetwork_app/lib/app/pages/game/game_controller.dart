import 'package:flutter/material.dart';
import 'package:socialnetwork/app/routes/routes.dart';

class GameController extends ChangeNotifier {

  Future<void> goToGameTictactoe(BuildContext context) async {
    Navigator.pushNamed(context, Routes.gameTictactoe);
  }

  Future<void> goToGameChess(BuildContext context) async {
    //Navigator.pushNamed(context, Routes.gameTictactoe);
  }

}