(()=>{var e={};e.id=433,e.ids=[433],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},32615:e=>{"use strict";e.exports=require("http")},35240:e=>{"use strict";e.exports=require("https")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},86624:e=>{"use strict";e.exports=require("querystring")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},35536:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>O,patchFetch:()=>E,requestAsyncStorage:()=>_,routeModule:()=>p,serverHooks:()=>q,staticGenerationAsyncStorage:()=>m});var s={};r.r(s),r.d(s,{GET:()=>l});var i=r(49303),a=r(88716),o=r(60670),n=r(87070),u=r(75571),c=r(90455),d=r(9487);async function l(e){try{let e=await (0,u.getServerSession)(c.L);if(!e||"student"!==e.user.role)return n.NextResponse.json({error:"Unauthorized"},{status:401});let[t]=await d.db.execute(`
      SELECT COUNT(*) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND c.is_active = TRUE
    `,[e.user.id]),r=t[0].count,[s]=await d.db.execute(`
      SELECT COUNT(*) as count 
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = ? AND q.is_active = TRUE
      AND (q.start_time IS NULL OR q.start_time <= NOW())
      AND (q.end_time IS NULL OR q.end_time >= NOW())
    `,[e.user.id]),i=s[0].count,[a]=await d.db.execute(`
      SELECT COUNT(*) as count 
      FROM quiz_attempts qa
      WHERE qa.student_id = ? AND qa.is_completed = TRUE
    `,[e.user.id]),o=a[0].count,[l]=await d.db.execute(`
      SELECT AVG(CASE WHEN max_score > 0 THEN (score / max_score) * 100 ELSE 0 END) as avg_score
      FROM quiz_attempts
      WHERE student_id = ? AND is_completed = TRUE
    `,[e.user.id]),p=Math.round(l[0].avg_score||0),[_]=await d.db.execute(`
      SELECT q.id, q.title, c.title as course, 
             COALESCE(q.end_time, 'No deadline') as due_date
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = e.student_id AND qa.is_completed = TRUE
      WHERE e.student_id = ? AND q.is_active = TRUE
      AND (q.start_time IS NULL OR q.start_time <= NOW())
      AND (q.end_time IS NULL OR q.end_time >= NOW())
      AND qa.id IS NULL
      ORDER BY q.end_time ASC
      LIMIT 5
    `,[e.user.id]),m=_.map(e=>({id:e.id,title:e.title,course:e.course,dueDate:"No deadline"===e.due_date?"No deadline":new Date(e.due_date).toLocaleDateString()})),[q]=await d.db.execute(`
      SELECT al.id, al.action, 
             DATE_FORMAT(al.created_at, '%M %d, %Y at %h:%i %p') as timestamp
      FROM activity_logs al
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT 10
    `,[e.user.id]),O=q.map(e=>({id:e.id,action:e.action,timestamp:e.timestamp}));return n.NextResponse.json({enrolledCourses:r,availableQuizzes:i,completedQuizzes:o,averageScore:p,upcomingQuizzes:m,recentActivity:O})}catch(e){return console.error("Student dashboard API error:",e),n.NextResponse.json({error:"Internal server error"},{status:500})}}let p=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/student/dashboard/route",pathname:"/api/student/dashboard",filename:"route",bundlePath:"app/api/student/dashboard/route"},resolvedPagePath:"C:\\Users\\Asus\\Downloads\\moodle-lms\\app\\api\\student\\dashboard\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:_,staticGenerationAsyncStorage:m,serverHooks:q}=p,O="/api/student/dashboard/route";function E(){return(0,o.patchFetch)({serverHooks:q,staticGenerationAsyncStorage:m})}},90455:(e,t,r)=>{"use strict";r.d(t,{L:()=>n});var s=r(53797),i=r(42023),a=r.n(i),o=r(9487);let n={providers:[(0,s.Z)({name:"credentials",credentials:{username:{label:"Username",type:"text"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.username||!e?.password)return null;try{let[t]=await o.db.execute("SELECT * FROM users WHERE username = ? AND is_active = TRUE",[e.username]),r=t[0];if(!r||!await a().compare(e.password,r.password_hash))return null;return await o.db.execute("INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)",[r.id,"login","127.0.0.1"]),{id:r.id.toString(),username:r.username,email:r.email,role:r.role,name:`${r.first_name} ${r.last_name}`}}catch(e){return console.error("Auth error:",e),null}}})],callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role,e.username=t.username),e),session:async({session:e,token:t})=>(t&&(e.user.id=t.sub,e.user.role=t.role,e.user.username=t.username),e)},pages:{signIn:"/login"},session:{strategy:"jwt"}}},9487:(e,t,r)=>{"use strict";r.d(t,{S:()=>o,db:()=>a});var s=r(73785);let i={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"lms_db",waitForConnections:!0,connectionLimit:10,queueLimit:0},a=s.createPool(i);function o(e,t){let r=e?.toLowerCase().includes("safeexambrowser"),s=t["x-safeexambrowser-requesthash"];return r&&!!s}},69955:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0})},75571:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s={};Object.defineProperty(t,"default",{enumerable:!0,get:function(){return a.default}});var i=r(69955);Object.keys(i).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in t&&t[e]===i[e]||Object.defineProperty(t,e,{enumerable:!0,get:function(){return i[e]}}))});var a=function(e,t){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=o(void 0);if(r&&r.has(e))return r.get(e);var s={__proto__:null},i=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in e)if("default"!==a&&({}).hasOwnProperty.call(e,a)){var n=i?Object.getOwnPropertyDescriptor(e,a):null;n&&(n.get||n.set)?Object.defineProperty(s,a,n):s[a]=e[a]}return s.default=e,r&&r.set(e,s),s}(r(45609));function o(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return(o=function(e){return e?r:t})(e)}Object.keys(a).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in t&&t[e]===a[e]||Object.defineProperty(t,e,{enumerable:!0,get:function(){return a[e]}}))})}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[276,612],()=>r(35536));module.exports=s})();