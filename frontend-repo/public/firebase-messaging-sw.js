// Firebase 서비스 워커
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBWaaDFnie2q0uxVsoKDJsxxer6h1DUh98",
  authDomain: "watchout-238c7.firebaseapp.com",
  projectId: "watchout-238c7",
  storageBucket: "watchout-238c7.appspot.com",
  messagingSenderId: "276857840662",
  appId: "1:276857840662:web:562f09d8f2913211314137"
}

firebase.initializeApp(firebaseConfig)

// 메시징 인스턴스
const messaging = firebase.messaging()

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log('🌙 백그라운드 메시지 수신!')
  console.log('📦 페이로드:', payload)
  
  const notificationTitle = payload.notification?.title || '알림'
  const notificationBody = payload.notification?.body || ''
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data,
    tag: 'background-notification'
  }
  
  self.registration.showNotification(notificationTitle, notificationOptions)
})
