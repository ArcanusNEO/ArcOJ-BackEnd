export default {
  'master': 1,                      // 最高权限位，一些奇奇怪怪的权限会检查
  'editGroup': 2,
  'getShareCode': 3,                // 还未实现，允不允许普通用户查看别人的公开代码，尚在讨论必要性
  'changeProfile': 4,
  'submitCode': 5,                  // 评测权限
  'editGlobalProblem': 6,
  'editLocalProblem': 7,
  'editGlobalProblemset': 8,
  'editLocalProblemset': 9,
  'editCourse': 10,
  'rejudgeGlobalProblem': 11,
  'rejudgeLocalProblem': 12,
  'postMessage': 13,
  'postAnnouncement': 14,
  'getGlobalCode': 15,              // 已废弃
  'getLocalCode': 16,               // 已废弃
  'getGlobalJudgeInfo': 17,         // 已废弃
  'getLocalJudgeInfo': 18,          // 已废弃
  'getJudgeInfo': 19,               // 指所有的
  'forkGlobalProblem': 20,
  'forkLocalProblem': 21,
  'joinCourse': 22,
  'joinProblemset': 23
}
// 大部分权限都用于管理页

// 设想中的权限
//                               Default User   Administrator   Read Only
// master                        0              0               0
// editGroup                     0              0               0
// getShareCode                  1              1               0
// changeProfile                 1              1               0
// submitCode                    1              1               0
// editGlobalProblem             0              0               0
// editLocalProblem              0              1               0
// editGlobalProblemset          0              0               0
// editLocalProblemset           0              1               0
// editCourse                    0              1               0
// rejudgeGlobalProblem          0              0               0
// rejudgeLocalProblem           0              1               0
// postMessage                   1              1               0
// postAnnouncement              0              1               0
// getGlobalCode                 0              0               0
// getLocalCode                  0              1               0
// getGlobalJudgeInfo            0              0               0
// getLocalJudgeInfo             0              1               0
// getJudgeInfo                  1              1               0
// forkGlobalProblem             0              1               0
// forkLocalProblem              0              1               0
// joinCourse                    1              1               0
// joinProblemset                1              1               0