const messaging = require("./firebaseconfig"); // Firebase SDK 로드

exports.sendPushNotification = async (token, title, body, data = {}) => {
  const message = {
    token: token, // FCM 토큰
    notification: {
      title: title,
      body: body,
    },
    data: data,
    android: {
      priority: "high",
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await messaging.send(message);
    console.log(" >>> success push notification :", response);
  } catch (error) {
    console.error(" >>> fail push notification :", error);
  }
};

// // 예제 실행
// const testFCMToken = "사용자의_FCM_토큰"; // 👈 실제 기기의 FCM 토큰으로 변경하세요!
// sendPushNotification(testFCMToken, "🚀 새로운 알림", "FCM 푸시 알림이 도착했습니다!");

//module.exports = sendPushNotification;