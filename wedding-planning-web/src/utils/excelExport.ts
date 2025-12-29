import * as XLSX from 'xlsx';

/**
 * Excel Export/Import Utilities
 * ------------------------------
 * Functions to export and import guest data to/from Excel files
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

