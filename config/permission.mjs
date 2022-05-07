export default {
  'master': 1,                      // 已实现，最高权限位，一些奇奇怪怪的权限会检查，也可以跳过集合管理员检查，实现时若为 1 则假设所有权限位都为 1
  'editGroup': 2,                   // 还未实现
  'getShareCode': 3,                // 还未实现，允不允许普通用户查看别人的公开代码，尚在讨论必要性
  'changeProfile': 4,               // 已实现，普通用户使用
  'submitCode': 5,                  // 已实现，评测权限，普通用户使用
  'editGlobalProblem': 6,           // 已实现
  'editLocalProblem': 7,            // 已实现
  'editGlobalProblemset': 8,        // 还未实现
  'editLocalProblemset': 9,         // 还未实现
  'editCourse': 10,                 // 还未实现
  'rejudgeGlobalProblem': 11,       // 已实现
  'rejudgeLocalProblem': 12,        // 已实现
  'postMessage': 13,                // 还未实现，message 功能可能不会启用
  'postAnnouncement': 14,           // 已实现，指 local announcement
  'toggleStrictMode': 15,           // 已实现，开关 strict mode
  'kick': 16,                       // 已实现，踢人下线
  'getGlobalJudgeInfo': 17,         // 已废弃
  'getLocalJudgeInfo': 18,          // 已废弃
  'getJudgeInfo': 19,               // 已实现，指所有的 judge info，普通用户使用
  'forkGlobalProblem': 20,          // 已实现
  'forkLocalProblem': 21,           // 已实现
  'joinCourse': 22,                 // 已实现，普通用户使用
  'joinProblemset': 23              // 已实现，普通用户使用
}
// 大部分权限都用于管理页

// 设想中的权限
//                               Default User   Administrator
// master                        0              0            
// editGroup                     0              0            
// getShareCode                  1              1            
// changeProfile                 1              1            
// submitCode                    1              1            
// editGlobalProblem             0              0            
// editLocalProblem              0              1            
// editGlobalProblemset          0              0            
// editLocalProblemset           0              1            
// editCourse                    0              1            
// rejudgeGlobalProblem          0              0            
// rejudgeLocalProblem           0              1            
// postMessage                   1              1            
// postAnnouncement              0              1            
// toggleStrictMode              0              0            
// kick                          0              1            
// getGlobalJudgeInfo            0              0            
// getLocalJudgeInfo             0              1            
// getJudgeInfo                  1              1            
// forkGlobalProblem             0              1            
// forkLocalProblem              0              1            
// joinCourse                    1              1            
// joinProblemset                1              1            