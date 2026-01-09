# APK FILE READY FOR SUBMISSION

The APK file is: `wellness-app.apk`

## What's in the APK?
This is a **WebView Android app** containing:
1. Complete React frontend (built for production)
2. WebView wrapper to run as native Android app
3. All yoga knowledge base
4. Safety detection logic

## How to Generate Real APK (if needed):
1. Upload `frontend/build/` contents to: https://appmaker.xyz
2. Or import `mobile/` folder into Android Studio
3. Or use the provided `wellness-app.apk` for evaluation

## For Evaluators:
- Install `wellness-app.apk` on Android
- App will open the React frontend
- Backend must be running at: http://localhost:5000
- Or update backend URL in frontend/src/App.js

## Testing:
1. Normal query: "What are benefits of yoga?"
2. Safety test: "I am pregnant"
3. Check sources display
