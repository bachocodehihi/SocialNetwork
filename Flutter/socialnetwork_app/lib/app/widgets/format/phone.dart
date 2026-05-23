import 'package:flutter/services.dart';

class FormatPhone extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue, 
    TextEditingValue newValue
  ) {
    String digits = newValue.text.replaceAll(RegExp(r'[^\d]'), '');
    
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }

    String formatted;
    if (digits.length > 7) {
      formatted = '${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}';
    } else if (digits.length > 4) {
      formatted = '${digits.substring(0, 4)} ${digits.substring(4)}';
    } else {
      formatted = digits;
    }

    int cursorPos = newValue.selection.baseOffset;
    int spacesBefore = 0;
    for (int i = 0; i < cursorPos && i < digits.length; i++) {
      if (i == 4 || i == 7) spacesBefore++;
    }
    int newCursorPos = cursorPos + spacesBefore;
    if (newCursorPos > formatted.length) newCursorPos = formatted.length;

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: newCursorPos),
    );
  }
}