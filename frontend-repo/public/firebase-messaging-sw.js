// Firebase 서비스 워커
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase 설정 (환경 변수 사용)
const firebaseConfig = {
  apiKey: "AIzaSyBWaaDFnie2q0uxVsoKDJsxxer6h1DUh98", // 환경 변수로 대체 예정
  authDomain: "watchout-238c7.firebaseapp.com",
  projectId: "watchout-238c7",
  storageBucket: "watchout-238c7.firebasestorage.app",
  messagingSenderId: "276857840662",
  appId: "1:276857840662:web:562f09d8f2913211314137"
}

firebase.initializeApp(firebaseConfig)

// 메시징 인스턴스
const messaging = firebase.messaging()

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload)
  
  const notificationTitle = payload.notification?.title || '알림'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
