import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    if (Platform.isAndroid) {
      return android;
    }
    if (Platform.isIOS) {
      return ios;
    }
    throw UnsupportedError(
      'DefaultFirebaseOptions are not supported for this platform.',
    );
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBW3xENkZz5xVz2gV3vVz2gV3vVz2gV3vV',
    appId: '1:123456789:web:abcdef1234567890abcdef',
    messagingSenderId: '123456789',
    projectId: 'sw1-admin',
    authDomain: 'sw1-admin.firebaseapp.com',
    storageBucket: 'sw1-admin.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBW3xENkZz5xVz2gV3vVz2gV3vVz2gV3vV',
    appId: '1:123456789:android:abcdef1234567890abcdef',
    messagingSenderId: '123456789',
    projectId: 'sw1-admin',
    storageBucket: 'sw1-admin.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBW3xENkZz5xVz2gV3vVz2gV3vVz2gV3vV',
    appId: '1:123456789:ios:abcdef1234567890abcdef',
    messagingSenderId: '123456789',
    projectId: 'sw1-admin',
    storageBucket: 'sw1-admin.appspot.com',
    iosBundleId: 'com.example.transitAi',
  );
}
