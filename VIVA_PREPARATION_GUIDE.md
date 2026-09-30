# 🎓 Student Management System - Viva & Project Defense Guide
**Department of Computer Engineering • Dharmsinh Desai University (DDU)**

---

## 📌 1. Project Overview (પ્રોજેક્ટની સામાન્ય ઓળખ)
> **Sir પૂછે:** *"What is your project about?"*
>
> **તમારો જવાબ (English/Gujarati Mix):**
> *"Sir, our project is a **MERN Stack Student Management System**. It provides a centralized digital portal for Dharmsinh Desai University with **Role-Based Access Control (RBAC)** for three main roles: **Admin**, **Teacher (Faculty)**, and **Student**.
> Admin can manage students, faculty, and course syllabus.
> Teachers can take lecture attendance, enter exam marks with automatic DDU grading (AA to FF), and answer student doubts.
> Students can track their attendance percentage (with 75% eligibility warning), view grade sheets, and ask academic queries to professors."*

---

## 🏗️ 2. System Architecture (MERN Stack Flow)

```
[React Frontend (Port 3000)]
         │
         │  Axios REST API Requests (JSON + Bearer JWT Token)
         ▼
[Express.js & Node.js Backend (Port 5000)]
         │
         │  Mongoose ODM (Models & Schema Validation)
         ▼
[MongoDB Database (StudentManagementDB)]
```

---

## 📂 3. Frontend Folder Structure (સરળ સમજૂતી)

| Folder / File | Purpose |
| :--- | :--- |
| `src/api/axios.js` | Axios instance setup. Request interceptor વડે દર વખતે `localStorage` માંથી JWT token આપોઆપ `Authorization: Bearer <token>` હેડરમાં મોકલાય છે. |
| `src/context/AuthContext.jsx` | ગ્લોબલ ઓથેન્ટિકેશન સ્ટેટ (`user`, `token`, `role`, `login`, `logout`) સાચવે છે. આખા પ્રોજેક્ટમાં ગમે તે કમ્પોનન્ટમાંથી `useAuth()` વાપરી શકાય. |
| `src/components/ProtectedRoute.jsx` | Route Guard છે. જો કોઈ લોગિન ન હોય તો `/login` પેજ પર મોકલે છે. જો કોઈ Student હોય અને Admin પેજ ખોલવા જાય તો તેને `/dashboard` રીડાયરેક્ટ કરે છે. |
| `src/components/Navbar.jsx` | ટોપ નેવિગેશન બાર, જેમાં યુઝરનું નામ, તેનો રોલ બેજ (Admin/Teacher/Student) અને Logout બટન છે. |
| `src/components/Sidebar.jsx` | ડાબી બાજુનું મેનૂ જે યુઝરના રોલ પ્રમાણે બદલાય છે. |
| `src/pages/Login.jsx` | લોગિન પેજ. વાઇવા માટે 1-ક્લિક ડેમો બટન આપેલા છે જેથી પાસવર્ડ ટાઈપ કરવામાં ભૂલ ન થાય. |
| `src/pages/Register.jsx` | રજીસ્ટ્રેશન પેજ. નવો વિદ્યાર્થી કે શિક્ષક પોતાનું એકાઉન્ટ બનાવી શકે છે, વાઇવા માટે 'Quick Fill' બટન પણ છે. |
| `src/pages/Dashboard.jsx` | દરેક રોલ માટે અલગ-અલગ ડેશબોર્ડ સ્ટેટિસ્ટિક્સ કાર્ડ્સ અને સમરી. |
| `src/pages/Students.jsx` | વિદ્યાર્થીઓનું લિસ્ટ, ડિપાર્ટમેન્ટ/સેમેસ્ટર ફિલ્ટર, સર્ચ અને નવો સ્ટુડન્ટ ઉમેરવાનો મોડલ. |
| `src/pages/Teachers.jsx` | ફેકલ્ટી લિસ્ટ અને નવો પ્રોફેસર ઉમેરવાનું પેજ. |
| `src/pages/Courses.jsx` | વિષયો (Syllabus), ક્રેડિટ્સ, અને કયા પ્રોફેસર કયો વિષય લે છે તેની વિગત. |
| `src/pages/Attendance.jsx` | પ્રોફેસર માટે ક્લાસની હાજરી લેવાનું અને સ્ટુડન્ટ માટે પોતાની હાજરીની ટકાવારી જોવાનું પેજ. |
| `src/pages/Marks.jsx` | માર્ક્સ એન્ટ્રી પેજ (DDU ની ગ્રેડિંગ સિસ્ટમ: AA, AB, BB, BC, CC, CD, FF). |
| `src/pages/Queries.jsx` | ડાઉટ સોલ્વિંગ ડેસ્ક (વિદ્યાર્થી પ્રશ્ન પૂછે અને પ્રોફેસર જવાબ આપે). |
| `src/pages/Notifications.jsx` | યુનિવર્સિટી પરિપત્રો અને નોટિસ બોર્ડ. |

---

## ⚡ 4. How to Run the Project (પ્રોજેક્ટ કેવી રીતે રન કરવો)

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Server running on port 5000 & Connected to MongoDB
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Local: http://localhost:3000
```

---

## 🔑 5. Live Demo Login Credentials (વાઇવા માટે એકાઉન્ટ્સ)

લોગિન પેજ પર નીચે **1-Click Buttons** આપેલા છે, અથવા તમે મેન્યુઅલી આ વાપરી શકો:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@ddu.ac.in` | `admin123` |
| **Teacher** | `vrund@ddu.ac.in` | `teacher123` |
| **Student** | `24ceuos155@ddu.ac.in` | `student123` |

---

## 🎯 6. Top 10 Most Frequently Asked Viva Questions & Answers

### Q1: What is the MERN stack and how does data flow in your project?
**Answer:**
> *"MERN stands for **MongoDB, Express.js, React.js, and Node.js**.*
> *Client-side (React) માં યુઝર ઇન્ટરેક્શન થાય છે (જેમ કે લોગિન અથવા હાજરી સબમિટ કરવી).*
> *React માંથી **Axios** દ્વારા HTTP Request (GET/POST/PUT/DELETE) Node.js/Express.js backend server (Port 5000) પર જાય છે.*
> *Express.js કંટ્રોલર **Mongoose** લાઈબ્રેરી મારફતે MongoDB Database માં Query કરે છે અને રિઝલ્ટ JSON ફોર્મેટમાં પાછું મોકલે છે.*
> *React તે JSON ડેટા મેળવીને `useState` અપડેટ કરે છે અને સ્ક્રીન પર નવો UI રેન્ડર કરે છે."*

---

### Q2: How does User Authentication & JWT work in your project?
**Answer:**
> *"Sir, we have implemented **Token-Based Authentication** using JSON Web Tokens (JWT):*
> 1. યુઝર પોતાનું Email અને Password સબમિટ કરે છે.
> 2. Backend માં `bcryptjs` થી પાસવર્ડ ચકાસાય છે. જો સાચો હોય તો `jsonwebtoken` લાઈબ્રેરી એક સહી થયેલો (signed) JWT Token જનરેટ કરે છે જેમાં User ID અને Role એન્કોડ હોય છે.
> 3. Frontend આ Token ને બ્રાઉઝરના `localStorage` માં સ્ટોર કરે છે.
> 4. `src/api/axios.js` માં Request Interceptor મૂકેલો છે, જે દરેક API કૉલ વખતે Headers માં `Authorization: Bearer <token>` આપોઆપ જોડે છે.
> 5. Backend નું `authMiddleware.js` આ ટોકનને verify કરે છે અને Request આગળ વધવા દે છે."*

---

### Q3: What is Role-Based Access Control (RBAC) and how did you implement it in React?
**Answer:**
> *"Sir, we have 3 roles: Admin, Teacher, and Student.*
> *Frontend માં અમે `ProtectedRoute.jsx` નામનો કમ્પોનન્ટ બનાવ્યો છે જે React Router ના `<Outlet />` સાથે કામ કરે છે.*
> *દાખલા તરીકે: `<Route element={<ProtectedRoute allowedRoles={['Admin']} />}>`*
> *જો કોઈ Student લોગિન થયેલો હોય અને `/students` કે `/teachers` URL પર જવાનો પ્રયત્ન કરે, તો `ProtectedRoute` તેને સીધો `/dashboard` પર રીડાયરેક્ટ કરી દે છે."*

---

### Q4: Why did you use React Context API instead of Redux?
**Answer:**
> *"Sir, our authentication state (user, token, role) needs to be accessible across all components.*
> *Redux એ ખૂબ વધારે boilerplate કોડ અને વધારાની લાઈબ્રેરીઓ માગે છે.*
> *React Context API એ React નો બિલ્ટ-ઇન ફીચર છે, ખૂબ લાઇટવેઇટ છે અને કોડ સમજવામાં અને મેઇન્ટેન કરવામાં અત્યંત સરળ છે. તેથી અમે `AuthContext.jsx` બનાવ્યો છે."*

---

### Q5: How is DDU Grading calculated in your system?
**Answer:**
> *"Sir, Dharmsinh Desai University uses an absolute grading system:*
> - **85% or above:** AA (Grade Point: 10) - Pass
> - **75% to 84%:** AB (Grade Point: 9) - Pass
> - **65% to 74%:** BB (Grade Point: 8) - Pass
> - **55% to 64%:** BC (Grade Point: 7) - Pass
> - **45% to 54%:** CC (Grade Point: 6) - Pass
> - **35% to 44%:** CD (Grade Point: 5) - Pass
> - **Below 35%:** FF (Grade Point: 0) - Fail
> 
> *પ્રોફેસર જ્યારે માર્ક્સ નાખે છે ત્યારે frontend માં લાઈવ ગ્રેડ દેખાય છે અને backend માં `marksController.js` માં `calculateGrade()` હેલ્પર ફંક્શન આપોઆપ ગ્રેડ સ્ટોર કરે છે."*

---

### Q6: What is the 75% Attendance Rule in your project?
**Answer:**
> *"Sir, as per university guidelines, students must maintain a minimum of 75% attendance.*
> *Student Dashboard અને Attendance પેજ પર જો વિદ્યાર્થીની હાજરી 75% થી ઓછી હોય, તો સ્ક્રીન પર ખાસ પીળા રંગનો **'Warning: Low Attendance'** એલર્ટ બોક્સ ડિસ્પ્લે થાય છે, જે જણાવે છે કે પરીક્ષામાં બેસવા માટે 75% હાજરી ફરજિયાત છે."*

---

### Q7: Why did you use Vite instead of Create-React-App (CRA)?
**Answer:**
> *"Sir, Create React App (CRA) હવે React ની ઓફિશિયલ ટીમ દ્વારા deprecated જાહેર કરાયું છે અને તે ધીમું છે.*
> *Vite એ Native ES Modules (ESM) અને Rollup બંડલર વાપરે છે. તે ખૂબ ઝડપી સર્વર સ્ટાર્ટ કરે છે અને Hot Module Replacement (HMR) એકદમ ઇન્સ્ટન્ટ આપે છે."*

---

### Q8: What are React Hooks and which ones did you use?
**Answer:**
> *"Sir, Hooks are functions that let us use state and lifecycle features inside functional components.*
> *અમે નીચેના મુખ્ય hooks વાપર્યા છે:*
> 1. `useState`: કમ્પોનન્ટનું લોકલ સ્ટેટ (જેમ કે ફોર્મ ઇનપુટ્સ, લોડિંગ ફ્લેગ્સ, ડેટા લિસ્ટ) સાચવવા માટે.
> 2. `useEffect`: કમ્પોનન્ટ માઉન્ટ થાય ત્યારે બેકએન્ડમાંથી API ફેચ કરવા માટે.
> 3. `useContext`: `AuthContext` માંથી લોગિન યુઝર અને ટોકન મેળવવા માટે.
> 4. `useNavigate`: બટન ક્લિક પર પેજ બદલવા માટે (React Router)."*

---

### Q9: How do you prevent SQL Injection / NoSQL Injection?
**Answer:**
> *"Sir, MongoDB માં Mongoose Schema Validation વાપરેલ છે જે પ્રકાર (Types) અને ડેટા વેલિડેશન કરે છે.*
> *ઉપરાંત પાસવર્ડ હંમેશા `bcryptjs` વડે 10 salt rounds સાથે hash થઈને સ્ટોર થાય છે, ક્યારેય plain text માં સેવ થતો નથી."*

---

### Q10: What is the difference between Single Page Application (SPA) and traditional Multi-Page Application?
**Answer:**
> *"Sir, our React frontend is a **Single Page Application (SPA)**.*
> *જ્યારે યુઝર એક પેજ પરથી બીજા પેજ પર જાય છે (દા.ત. Dashboard થી Attendance), ત્યારે આખું બ્રાઉઝર રિલોડ થતું નથી.*
> *`react-router-dom` ફક્ત જરૂરી કમ્પોનન્ટને DOM માં બદલે છે, જેનાથી વેબસાઇટ સુપર-ફાસ્ટ અને ડેસ્કટોપ સોફ્ટવેર જેવી સ્મૂથ લાગે છે."*
