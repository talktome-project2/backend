const express = require('express');
const router = express.Router();

const multer = require('multer');  // file download를 위한 미들웨어
const upload = multer({ dest: 'storage/' });

const authenticateToken = require('./middleware/authenticate');

const webController = require('./web/controller');
const apiFeedController = require('./api/feed/controller');
const apiUserController = require('./api/user/controller');
const fileController = require('./api/file/controller');
const apiFriendController = require('./api/friend/controller');
const chatController = require('./api/chat/controller');
const managerController = require('./api/manager/controller');

const { logRequestTime } = require('./middleware/log');

router.get('/manager/feed', managerController.index);
router.get('/manager/member/id/:id', managerController.getMemberInfoById);
router.get('/manager/member/email/:email', managerController.getMemberInfoByEmail);
router.get('/manager/friend/accept/:id', managerController.getAcceptFriendList); // 본인의 모든 친구 리턴
router.get('/manager/friend/block/me/:id', managerController.blockMeToOtherIndex); // 내가 차단한 사람
router.get('/manager/friend/block/other/:id', managerController.blockOtherToMeIndex); // 남이 나를 차단한 사람
router.get('/manager/count/datefeed', managerController.countDateFeed);
router.get('/manager/count/ios', managerController.countIOS);
router.get('/manager/count/android', managerController.countAndroid);
router.get('/manager/count/man', managerController.countMan);
router.get('/manager/count/woman', managerController.countWoman);
router.get('/manager/count/age', managerController.countAge);
router.get('/manager/count/region', managerController.countRegion);
router.delete('/manager/member/:id', managerController.deleteMember);

router.post('/file', upload.single('file'), fileController.upload);
router.get('/file/seq/:id', fileController.getSeqImage);
router.get('/file/:id', fileController.download);
router.post('/file/:id', fileController.update);
router.put('/file/profile/:id', fileController.updateProfileImageId);
router.delete('/file/profile/:id', fileController.deleteProfileImage);
router.delete('/file/seq/:id', fileController.deleteSeqImage);

router.get('/', webController.home);
// 특정 라우트에 대해 로그 미들웨어 적용
router.get('/page/:route', logRequestTime, webController.page);
// 전역적으로 로그 미들웨어 적용
router.use(logRequestTime);

router.post('/auth/register', apiUserController.register);
router.post('/auth/login', apiUserController.login);
router.get('/auth/member/:id', apiUserController.getMemberInfo);

// 피드 관련 라우트, 모든 요청에 인증 필요
// 이후 모든 라우트에 인증 적용
router.use(authenticateToken);

router.get('/api/member/img', fileController.getMemberProfileImage);

router.put('/api/fcm', apiUserController.fcmToken);

router.get('/api/feed', apiFeedController.index);
router.put('/api/feed/message', apiFeedController.message);

router.get('/api/friend/accept', apiFriendController.getAcceptFriendList); // 본인의 모든 친구 리턴
router.get('/api/friend/block', apiFriendController.blockIndex); // 내가 그리고 남이 나를 차단한 사람
router.get('/api/friend/send', apiFriendController.getSendFriendList);
router.get('/api/friend/receive', apiFriendController.getReceiveFriendList);
router.get('/api/friend/member/:id', apiFriendController.getMemberInfo);
router.get('/api/friend/:id/block', apiFriendController.isBlockFriend); // 내가 특정 사람과 차단했나 
router.get('/api/friend/:id', apiFriendController.isFriend); // 특정 사람과 친구사이인가
router.get('/api/friend/:id/pending', apiFriendController.isPendingFriend); //특정 사람과 친구 신청중인가
router.get('/api/friend/:id/deny', apiFriendController.isDenyFriend); // 특정 사람과 친구거절인가
router.delete('/api/friend/:id', apiFriendController.delete); // 특정 사람과 친구 해제
router.post('/api/friend/block', apiFriendController.blockFriend); // 특정 사람 차단
router.post('/api/friend/message', apiFriendController.sendMessageFriend); // 친구신청 메시지 보내기
router.put('/api/friend/:id/agree', apiFriendController.agreeSuggestion);
router.put('/api/friend/:id/deny', apiFriendController.denySuggestion);

router.put('/api/user/my/nickname', apiUserController.changeNickname);
router.put('/api/user/my/region', apiUserController.changeRegion);
router.put('/api/user/my/age', apiUserController.changeAge);
router.put('/api/user/my/intro', apiUserController.changeIntro);

router.get('/api/chat/room', chatController.roomIndex);
router.get('/api/chat/room/:id', chatController.getMissedMessages);
router.post('/api/chat/room', chatController.enterRoom);


module.exports = router;