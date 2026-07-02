import 'package:flutter/material.dart';
import 'package:socialnetwork/app/pages/content/content_view.dart';

class ContentPage extends StatelessWidget {
  final Map<String, dynamic> post;

  const ContentPage({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    return ContentView(post: post);
  }
}
