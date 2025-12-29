import * as XLSX from 'xlsx';
import { Task, Vendor, Epic } from '@/types';

/**
 * Excel Export/Import Utilities
 * ------------------------------
 * Functions to export and import data to/from Excel/CSV files
 */

export interface GuestData {
  name: string;
  phone?: string;
  email?: string;
  side: 'partner1' | 'partner2' | 'both';
  invited: boolean;
  confirmed?: boolean;
  guests?: number;
  tableNumber?: number;
  notes?: string;
}

/**
 * Export tasks data to Excel or CSV file
 */
export const exportTasksToExcel = (
  tasks: Task[],
  epics: Epic[],
  format: 'xlsx' | 'csv' = 'xlsx',
  fileName: string = 'דוח_משימות'
) => {
  const getEpicTitle = (epicId: string) => epics.find(e => e.id === epicId)?.title || 'כללי';
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return priority;
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'הושלמה';
      case 'in-progress': return 'בתהליך';
      case 'pending': return 'ממתינה';
      case 'cancelled': return 'בוטלה';
      default: return status;
    }
  };

  const data = tasks.map(task => ({
    'כותרת': task.title,
    'תיאור': task.description || '',
    'נושא': getEpicTitle(task.epicId),
    'עדיפות': getPriorityText(task.priority),
    'סטטוס': getStatusText(task.status),
    'תאריך יעד': task.dueDate ? new Date(task.dueDate).toLocaleDateString('he-IL') : '',
    'תאריך השלמה': task.completedAt ? new Date(task.completedAt).toLocaleDateString('he-IL') : '',
    'הערות': task.notes || '',
    'תאריך יצירה': new Date(task.createdAt).toLocaleDateString('he-IL'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 30 }, // כותרת
    { wch: 40 }, // תיאור
    { wch: 15 }, // נושא
    { wch: 12 }, // עדיפות
    { wch: 12 }, // סטטוס
    { wch: 15 }, // תאריך יעד
    { wch: 15 }, // תאריך השלמה
    { wch: 30 }, // הערות
    { wch: 15 }, // תאריך יצירה
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'משימות');

  // Add summary sheet
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  
  const summary = [
    ['סיכום משימות'],
    [''],
    ['סה"כ משימות', tasks.length],
    ['הושלמו', completed],
    ['בתהליך', inProgress],
    ['ממתינות', pending],
    ['אחוז השלמה', `${tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%`],
    [''],
    ['לפי עדיפות:'],
    ['גבוהה', tasks.filter(t => t.priority === 'high').length],
    ['בינונית', tasks.filter(t => t.priority === 'medium').length],
    ['נמוכה', tasks.filter(t => t.priority === 'low').length],
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summary);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'סיכום');

  XLSX.writeFile(workbook, `${fileName}.${format}`);
};

/**
 * Export vendors data to Excel or CSV file
 */
export const exportVendorsToExcel = (
  vendors: Vendor[],
  format: 'xlsx' | 'csv' = 'xlsx',
  fileName: string = 'דוח_ספקים'
) => {
  const data = vendors.map(vendor => ({
    'שם הספק': vendor.name,
    'קטגוריה': vendor.category,
    'טלפון': vendor.phone || '',
    'אימייל': vendor.email || '',
    'אתר': vendor.website || '',
    'כתובת': vendor.address || '',
    'מחיר משוער': vendor.price ? `₪${vendor.price.toLocaleString()}` : '',
    'מחיר בפועל': vendor.actualPrice ? `₪${vendor.actualPrice.toLocaleString()}` : '',
    'נבחר': vendor.isSelected ? 'כן' : 'לא',
    'דירוג': vendor.rating ? `${vendor.rating}/5` : '',
    'הערות': vendor.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 25 }, // שם
    { wch: 15 }, // קטגוריה
    { wch: 15 }, // טלפון
    { wch: 25 }, // אימייל
    { wch: 25 }, // אתר
    { wch: 30 }, // כתובת
    { wch: 15 }, // מחיר משוער
    { wch: 15 }, // מחיר בפועל
    { wch: 10 }, // נבחר
    { wch: 10 }, // דירוג
    { wch: 30 }, // הערות
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ספקים');

  // Add budget summary
  const selectedVendors = vendors.filter(v => v.isSelected);
  const totalEstimated = selectedVendors.reduce((sum, v) => sum + (v.price || 0), 0);
  const totalActual = selectedVendors.reduce((sum, v) => sum + (v.actualPrice || 0), 0);
  
  const summary = [
    ['סיכום ספקים ותקציב'],
    [''],
    ['סה"כ ספקים', vendors.length],
    ['ספקים שנבחרו', selectedVendors.length],
    [''],
    ['תקציב:'],
    ['סה"כ מחיר משוער', `₪${totalEstimated.toLocaleString()}`],
    ['סה"כ מחיר בפועל', `₪${totalActual.toLocaleString()}`],
    ['הפרש', `₪${(totalEstimated - totalActual).toLocaleString()}`],
    [''],
    ['לפי קטגוריה:'],
  ];

  // Group by category
  const categories = [...new Set(vendors.map(v => v.category))];
  categories.forEach(cat => {
    const catVendors = vendors.filter(v => v.category === cat && v.isSelected);
    const catTotal = catVendors.reduce((sum, v) => sum + (v.actualPrice || v.price || 0), 0);
    summary.push([cat, `₪${catTotal.toLocaleString()}`]);
  });

  const summaryWs = XLSX.utils.aoa_to_sheet(summary);
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'סיכום תקציב');

  XLSX.writeFile(workbook, `${fileName}.${format}`);
};

/**
 * Export budget report to Excel or CSV file
 */
export const exportBudgetToExcel = (
  vendors: Vendor[],
  budget: number,
  format: 'xlsx' | 'csv' = 'xlsx',
  fileName: string = 'דוח_תקציב'
) => {
  try {
    // Use all vendors with prices (not just selected)
    const vendorsWithPrices = vendors.filter(v => v.price || v.actualPrice);
    const totalSpent = vendorsWithPrices.reduce((sum, v) => sum + (v.actualPrice || v.price || 0), 0);
    const remaining = budget - totalSpent;

    // Expense details - include all vendors
    const expenses = vendorsWithPrices.length > 0 
      ? vendorsWithPrices.map(vendor => ({
          'קטגוריה': vendor.category,
          'ספק': vendor.name,
          'נבחר': vendor.isSelected ? 'כן' : 'לא',
          'מחיר משוער': vendor.price || 0,
          'מחיר בפועל': vendor.actualPrice || vendor.price || 0,
          'הפרש': (vendor.price || 0) - (vendor.actualPrice || vendor.price || 0),
        }))
      : [{ 'קטגוריה': 'אין נתונים', 'ספק': '', 'נבחר': '', 'מחיר משוער': 0, 'מחיר בפועל': 0, 'הפרש': 0 }];

    const worksheet = XLSX.utils.json_to_sheet(expenses);
    worksheet['!cols'] = [
      { wch: 20 }, // קטגוריה
      { wch: 25 }, // ספק
      { wch: 10 }, // נבחר
      { wch: 15 }, // מחיר משוער
      { wch: 15 }, // מחיר בפועל
      { wch: 15 }, // הפרש
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'הוצאות');

    // Summary
    const summary = [
      ['דוח תקציב חתונה'],
      [''],
      ['תקציב כולל', `₪${budget.toLocaleString()}`],
      ['סה"כ הוצאות', `₪${totalSpent.toLocaleString()}`],
      ['נותר', `₪${remaining.toLocaleString()}`],
      ['אחוז ניצול', `${budget > 0 ? Math.round((totalSpent / budget) * 100) : 0}%`],
      [''],
      ['סה"כ ספקים', vendors.length.toString()],
      [''],
      ['פירוט לפי קטגוריה:'],
    ];

    // Group by category
    const categories = [...new Set(vendorsWithPrices.map(v => v.category))];
    categories.forEach(cat => {
      const catVendors = vendorsWithPrices.filter(v => v.category === cat);
      const catTotal = catVendors.reduce((sum, v) => sum + (v.actualPrice || v.price || 0), 0);
      const percentage = budget > 0 ? Math.round((catTotal / budget) * 100) : 0;
      summary.push([cat, `₪${catTotal.toLocaleString()} (${percentage}%)`]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summary);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, summaryWs, 'סיכום');

    XLSX.writeFile(workbook, `${fileName}.${format}`);
  } catch (error) {
    console.error('Error exporting budget:', error);
    alert('שגיאה בייצוא דוח התקציב');
  }
};

/**
 * Export guests data to Excel file
 */
export const exportGuestsToExcel = (
  guests: GuestData[] = [],
  fileName: string = 'רשימת_אורחים.xlsx'
) => {
  // Create empty template if no guests
  const data = guests.length > 0 ? guests : [
    {
      name: 'דוגמה: ישראל ישראלי',
      phone: '050-1234567',
      email: 'israel@example.com',
      side: 'partner1',
      invited: true,
      confirmed: false,
      guests: 2,
      tableNumber: 1,
      notes: 'הערות כלליות'
    }
  ];

  // Convert to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(data.map(guest => ({
    'שם מלא': guest.name,
    'טלפון': guest.phone || '',
    'אימייל': guest.email || '',
    'צד': guest.side === 'partner1' ? 'צד א' : guest.side === 'partner2' ? 'צד ב' : 'משותף',
    'הוזמן': guest.invited ? 'כן' : 'לא',
    'אישר הגעה': guest.confirmed ? 'כן' : guest.confirmed === false ? 'לא' : '',
    'מספר אורחים': guest.guests || 1,
    'שולחן': guest.tableNumber || '',
    'הערות': guest.notes || ''
  })));

  // Set column widths
  const colWidths = [
    { wch: 25 }, // שם
    { wch: 15 }, // טלפון
    { wch: 25 }, // אימייל
    { wch: 10 }, // צד
    { wch: 10 }, // הוזמן
    { wch: 12 }, // אישור
    { wch: 12 }, // אורחים
    { wch: 10 }, // שולחן
    { wch: 30 }, // הערות
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'אורחים');

  // Add instructions sheet
  const instructions = [
    ['הוראות מילוי רשימת אורחים'],
    [''],
    ['עמודה', 'הסבר', 'דוגמה'],
    ['שם מלא', 'שם האורח המלא', 'ישראל ישראלי'],
    ['טלפון', 'מספר טלפון (לא חובה)', '050-1234567'],
    ['אימייל', 'כתובת מייל (לא חובה)', 'israel@example.com'],
    ['צד', 'צד א / צד ב / משותף', 'צד א'],
    ['הוזמן', 'כן / לא', 'כן'],
    ['אישר הגעה', 'כן / לא / ריק אם לא ידוע', 'כן'],
    ['מספר אורחים', 'כמה אנשים (כולל האורח עצמו)', '2'],
    ['שולחן', 'מספר שולחן (לא חובה)', '1'],
    ['הערות', 'הערות נוספות (לא חובה)', 'צמחוני'],
    [''],
    ['טיפים:'],
    ['1. אל תמחק את שורת הכותרות (השורה הראשונה)'],
    ['2. מלא רק את העמודות הרלוונטיות'],
    ['3. אפשר להעתיק ולהדביק שורות'],
    ['4. שמור את הקובץ ועלה אותו חזרה למערכת'],
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
  instructionsWs['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, instructionsWs, 'הוראות');

  // Download file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Import guests data from Excel file
 */
export const importGuestsFromExcel = (file: File): Promise<GuestData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet (guests data)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Map to GuestData format
        const guests: GuestData[] = jsonData.map((row: any) => ({
          name: row['שם מלא'] || '',
          phone: row['טלפון'] || undefined,
          email: row['אימייל'] || undefined,
          side: row['צד'] === 'צד א' 
            ? 'partner1' 
            : row['צד'] === 'צד ב' 
            ? 'partner2' 
            : 'both',
          invited: row['הוזמן'] === 'כן',
          confirmed: row['אישר הגעה'] === 'כן' 
            ? true 
            : row['אישר הגעה'] === 'לא' 
            ? false 
            : undefined,
          guests: parseInt(row['מספר אורחים']) || 1,
          tableNumber: parseInt(row['שולחן']) || undefined,
          notes: row['הערות'] || undefined,
        })).filter(guest => guest.name); // Remove empty rows

        resolve(guests);
      } catch (error) {
        reject(new Error('שגיאה בקריאת הקובץ. ודא שזה קובץ Excel תקין'));
      }
    };

    reader.onerror = () => {
      reject(new Error('שגיאה בטעינת הקובץ'));
    };

    reader.readAsBinaryString(file);
  });
};

