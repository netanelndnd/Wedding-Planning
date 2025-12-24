# 🔥 Firebase Realtime Database - מדריך הגדרה

## סקירה כללית

האפליקציה עברה מ-**Firestore** ל-**Realtime Database**. זה מאפשר:
- ✅ עדכונים בזמן אמת (Real-time sync)
- ✅ מבנה JSON פשוט
- ✅ ביצועים מהירים יותר
- ✅ תמיכה אופציונלית ב-Firestore (אפשר להשתמש בשניהם)

---

## 📋 הגדרות נדרשות

### 1. Firebase Console - יצירת Realtime Database

1. לך ל-[Firebase Console](https://console.firebase.google.com/)
2. בחר את הפרויקט שלך
3. לך ל-**Realtime Database** (בתפריט השמאלי)
4. לחץ על **Create Database**
5. בחר **Start in test mode** (לפיתוח) או **Start in production mode**
6. בחר את המיקום (Location) - מומלץ: `europe-west1` או `us-central1`
7. לחץ **Done**

### 2. קבלת Database URL

לאחר יצירת ה-Database, תקבל URL בדומה ל:
```
https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app
```

### 3. עדכון .env.local

הוסף את ה-URL ל-`.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Realtime Database URL
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app
```

---

## 📊 מבנה הנתונים ב-Realtime Database

הנתונים נשמרים במבנה JSON היררכי:

```json
{
  "users": {
    "user_uid_1": {
      "couple": {
        "partner1Name": "ישראל",
        "partner2Name": "ישראלה",
        "weddingDate": 1728604800000,
        "createdAt": 1705315200000,
        "updatedAt": 1705315200000
      },
      "tasks": {
        "task_id_1": {
          "id": "task_id_1",
          "coupleId": "user_uid_1",
          "epicId": "epic_id_1",
          "title": "הזמנת אולם",
          "description": "לבחור ולהזמין אולם לחתונה",
          "category": "venue",
          "priority": "high",
          "status": "pending",
          "dueDate": 1728604800000,
          "createdAt": 1705315200000,
          "updatedAt": 1705315200000
        },
        "task_id_2": { ... }
      },
      "epics": {
        "epic_id_1": {
          "id": "epic_id_1",
          "coupleId": "user_uid_1",
          "title": "משימות כלליות",
          "description": "משימות חשובות לתכנון החתונה",
          "category": "general",
          "color": "#ec4899",
          "order": 0,
          "createdAt": 1705315200000,
          "updatedAt": 1705315200000
        }
      },
      "guests": {
        "guest_id_1": {
          "id": "guest_id_1",
          "coupleId": "user_uid_1",
          "name": "דוד כהן",
          "email": "david@example.com",
          "phone": "050-1234567",
          "rsvpStatus": "pending",
          "createdAt": 1705315200000,
          "updatedAt": 1705315200000
        }
      },
      "vendors": {
        "vendor_id_1": {
          "id": "vendor_id_1",
          "coupleId": "user_uid_1",
          "name": "צלם מקצועי",
          "category": "photography",
          "phone": "050-9876543",
          "isSelected": false,
          "createdAt": 1705315200000,
          "updatedAt": 1705315200000
        }
      }
    },
    "user_uid_2": { ... }
  }
}
```

---

## 🔧 שימוש בקוד

### 1. ייבוא השירות

```typescript
import { taskService, epicService, guestService, vendorService, coupleService } from '@/services/realtimeService';
```

### 2. שמירת נתוני זוג

```typescript
import { coupleService } from '@/services/realtimeService';

await coupleService.saveCouple(user.uid, {
  partner1Name: 'ישראל',
  partner2Name: 'ישראלה',
  weddingDate: new Date('2025-10-10'),
});
```

### 3. הוספת משימה

```typescript
import { taskService } from '@/services/realtimeService';

const taskId = await taskService.addTask(user.uid, {
  title: 'הזמנת אולם',
  description: 'לבחור ולהזמין אולם לחתונה',
  epicId: 'epic_id_1',
  category: 'venue',
  priority: 'high',
  status: 'pending',
  dueDate: new Date('2025-08-01'),
});
```

### 4. עדכון משימה

```typescript
await taskService.updateTask(taskId, {
  status: 'completed',
  completedAt: new Date(),
});
```

### 5. מחיקת משימה

```typescript
await taskService.deleteTask(taskId);
```

### 6. האזנה לשינויים בזמן אמת

```typescript
import { taskService } from '@/services/realtimeService';

const unsubscribe = taskService.subscribeToTasks(user.uid, (tasks) => {
  console.log('Tasks updated:', tasks);
  // עדכן את ה-UI עם המשימות החדשות
});

// כשאתה לא צריך יותר את המאזין:
unsubscribe();
```

---

## 🔒 Security Rules

עדכן את ה-Security Rules ב-Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "users": {
      "$userId": {
        // רק המשתמש המחובר יכול לקרוא ולכתוב את הנתונים שלו
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        
        "couple": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        },
        "tasks": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        },
        "epics": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        },
        "guests": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        },
        "vendors": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

---

## 🔄 מעבר מ-Firestore ל-Realtime Database

### אופציה 1: שימוש רק ב-Realtime Database

1. החלף את כל הייבואים מ-`firestoreService` ל-`realtimeService`:

```typescript
// לפני:
import { taskService } from '@/services/firestoreService';

// אחרי:
import { taskService } from '@/services/realtimeService';
```

2. עדכן את `useSignupForm.ts` להשתמש ב-`coupleService`:

```typescript
import { coupleService, epicService, taskService } from '@/services/realtimeService';

// במקום setDoc:
await coupleService.saveCouple(user.uid, {
  partner1Name: formData.partner1Name,
  partner2Name: formData.partner2Name,
  weddingDate: formData.weddingDate ? new Date(formData.weddingDate) : null,
});
```

### אופציה 2: שימוש בשניהם (Firestore + Realtime Database)

אפשר להשתמש בשניהם במקביל - כל שירות בנפרד.

---

## 📝 הערות חשובות

### 1. תאריכים
- ב-Realtime Database, תאריכים נשמרים כ-**timestamps** (מספרים)
- השירות ממיר אוטומטית בין `Date` ל-timestamp

### 2. IDs
- ב-Realtime Database, משתמשים ב-`push()` ליצירת ID ייחודי
- ה-ID נוצר אוטומטית על ידי Firebase

### 3. Real-time Updates
- `subscribeToTasks()` מחזיר פונקציה לביטול המאזין
- **חשוב** לקרוא ל-`unsubscribe()` כשהקומפוננטה נהרסת

### 4. ביצועים
- Realtime Database מהיר יותר לקריאות תכופות
- מתאים לעדכונים בזמן אמת
- מבנה JSON פשוט יותר

---

## 🐛 פתרון בעיות

### שגיאה: "Permission denied"
- בדוק את ה-Security Rules
- וודא שהמשתמש מחובר (`auth.uid` קיים)

### שגיאה: "Database URL not found"
- וודא שה-`NEXT_PUBLIC_FIREBASE_DATABASE_URL` מוגדר ב-`.env.local`
- הפעל מחדש את שרת הפיתוח (`npm run dev`)

### נתונים לא מתעדכנים
- בדוק שהמאזין (`onValue`) פעיל
- וודא שאתה מבטל את המאזין הישן לפני יצירת חדש

---

## 📚 קבצים רלוונטיים

- `src/lib/firebase.ts` - הגדרות Firebase (כולל Realtime Database)
- `src/services/realtimeService.ts` - כל הפעולות על Realtime Database
- `src/hooks/useSignupForm.ts` - יצירת משתמש ושמירת נתונים
- `.env.local` - הגדרות סביבה (כולל Database URL)

---

## ✅ סיכום

1. ✅ יצירת Realtime Database ב-Firebase Console
2. ✅ הוספת `NEXT_PUBLIC_FIREBASE_DATABASE_URL` ל-`.env.local`
3. ✅ עדכון Security Rules
4. ✅ החלפת `firestoreService` ב-`realtimeService` (אופציונלי)
5. ✅ עדכון `useSignupForm` להשתמש ב-`coupleService`

**הכל מוכן לשימוש! 🎉**

