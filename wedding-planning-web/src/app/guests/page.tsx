'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGuests } from '@/hooks/useGuests';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Guest } from '@/types';

/**
 * Guests Page
 * -----------
 * Manage wedding guests with Excel import/export and Firebase sync
 */
export default function GuestsPage() {
  const { user, loading: authLoading, couple } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    guests,
    guestsAsGuestData,
    loading,
    saving,
    uploadSuccess,
    error,
    stats,
    handleDownloadTemplate,
    handleFileUpload,
    addGuestFromForm,
    updateGuest,
    deleteGuest,
    goToDashboard,
  } = useGuests();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'משותף',
    plusOne: 0,
    rsvpStatus: 'pending' as Guest['rsvpStatus'],
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: 'משותף',
      plusOne: 0,
      rsvpStatus: 'pending',
      notes: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingGuest(null);
    setShowAddModal(true);
  };

  const openEditModal = (guest: Guest) => {
    setFormData({
      name: guest.name,
      phone: guest.phone || '',
      email: guest.email || '',
      relationship: guest.relationship || 'משותף',
      plusOne: guest.plusOne || 0,
      rsvpStatus: guest.rsvpStatus,
      notes: guest.notes || '',
    });
    setEditingGuest(guest);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingGuest(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGuest) {
      // Update existing guest
      await updateGuest(editingGuest.id, {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        relationship: formData.relationship,
        plusOne: formData.plusOne,
        rsvpStatus: formData.rsvpStatus,
        notes: formData.notes || undefined,
      });
    } else {
      // Add new guest
      await addGuestFromForm({
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        relationship: formData.relationship,
        plusOne: formData.plusOne,
        rsvpStatus: formData.rsvpStatus,
        notes: formData.notes || undefined,
      });
    }
    
    closeModal();
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    goToDashboard();
    return null;
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (confirm(`האם למחוק את האורח "${guestName}"?`)) {
      await deleteGuest(guestId);
    }
  };

  return (
    <div className="min-h-screen wedding-bg">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl font-serif font-bold text-white mb-2">
                ניהול אורחים
              </h1>
              <p className="text-white/80 text-lg font-sans">
                {couple ? `לחתונה של ${couple.partner1Name} ו${couple.partner2Name}` : 'ניהול רשימת אורחים'}
              </p>
            </div>
            <button
              onClick={goToDashboard}
              className="px-4 py-2.5 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg"
            >
              ← חזרה
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        {guests.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[#6D28D9]">{stats.total}</div>
              <div className="text-sm text-[#6B6573]">אורחים</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[#BE185D]">{stats.totalWithPlusOnes}</div>
              <div className="text-sm text-[#6B6573]">סה"כ מוזמנים</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[#87A878]">{stats.accepted}</div>
              <div className="text-sm text-[#6B6573]">אישרו הגעה</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-red-500">{stats.declined}</div>
              <div className="text-sm text-[#6B6573]">סירבו</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-[#D4AF37]">{stats.pending}</div>
              <div className="text-sm text-[#6B6573]">ממתינים</div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#87A878]/10 to-[#87A878]/5 border border-[#87A878]/30 rounded-xl text-[#87A878] animate-fadeIn shadow-sm">
            <div>
              <strong className="font-semibold">הצלחה!</strong>
              <p className="mt-1">ייבאנו {guests.length} אורחים מהקובץ ושמרנו ב-Firebase</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl text-red-600 animate-fadeIn shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {/* Saving Indicator */}
        {saving && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#6D28D9]/10 to-[#6D28D9]/5 border border-[#6D28D9]/30 rounded-xl text-[#6D28D9] animate-fadeIn shadow-sm">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6D28D9]"></div>
              <span>שומר אורחים ל-Firebase...</span>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Download Template / Export */}
          <div className="glass p-8 rounded-2xl shadow-modern card-hover animate-fadeIn">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-[#6D28D9]/10 to-[#6D28D9]/20 rounded-2xl inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2D2A32] mb-3">
                {guests.length > 0 ? 'ייצוא לאקסל' : 'הורדת תבנית Excel'}
              </h2>
              <p className="text-[#6B6573] mb-6 font-sans">
                {guests.length > 0 
                  ? `הורד קובץ Excel עם ${guests.length} האורחים הקיימים`
                  : 'הורד קובץ Excel עם טופס מוכן למילוי רשימת אורחים'
                }
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="btn-primary mx-auto"
              >
                {guests.length > 0 ? 'ייצוא אורחים לאקסל' : 'הורד תבנית Excel'}
              </button>
              <div className="mt-4 text-sm text-[#6B6573] font-sans">
                {guests.length > 0 ? 'הקובץ יכלול את כל האורחים' : 'הקובץ כולל דף הוראות מפורט'}
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className="glass p-8 rounded-2xl shadow-modern card-hover animate-fadeIn">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-[#87A878]/10 to-[#87A878]/20 rounded-2xl inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#87A878]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2D2A32] mb-3">ייבוא מאקסל</h2>
              <p className="text-[#6B6573] mb-6 font-sans">
                העלה קובץ Excel עם רשימת אורחים. הנתונים יישמרו אוטומטית ב-Firebase.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={onFileChange}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                disabled={loading || saving}
                className="px-8 py-3 bg-gradient-to-r from-[#87A878] to-[#6B8E5E] text-white rounded-xl font-semibold hover:from-[#6B8E5E] hover:to-[#5A7D4E] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none mx-auto"
              >
                {saving ? 'שומר...' : loading ? 'מייבא...' : 'העלה קובץ Excel'}
              </button>
              <div className="mt-4 text-sm text-[#6B6573] font-sans">
                {guests.length > 0 
                  ? 'הייבוא יוסיף אורחים חדשים לרשימה הקיימת'
                  : 'קבצים נתמכים: .xlsx, .xls'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Instructions - only show when no guests */}
        {guests.length === 0 && !loading && (
          <div className="glass p-8 rounded-2xl shadow-modern mb-8 animate-fadeIn">
            <h3 className="text-2xl font-serif font-bold text-[#2D2A32] mb-6">
              הוראות שימוש
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-[#6D28D9]/5 to-[#6D28D9]/10 rounded-xl border border-[#6D28D9]/10">
                <div className="w-12 h-12 bg-[#6D28D9] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">1</div>
                <h4 className="font-serif font-bold text-[#2D2A32] mb-2">הורד תבנית</h4>
                <p className="text-sm text-[#6B6573] font-sans">לחץ על "הורד תבנית Excel" כדי לקבל את הקובץ</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-[#BE185D]/5 to-[#BE185D]/10 rounded-xl border border-[#BE185D]/10">
                <div className="w-12 h-12 bg-[#BE185D] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">2</div>
                <h4 className="font-serif font-bold text-[#2D2A32] mb-2">מלא פרטים</h4>
                <p className="text-sm text-[#6B6573] font-sans">פתח את הקובץ ב-Excel ומלא את פרטי האורחים</p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-[#87A878]/5 to-[#87A878]/10 rounded-xl border border-[#87A878]/10">
                <div className="w-12 h-12 bg-[#87A878] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">3</div>
                <h4 className="font-serif font-bold text-[#2D2A32] mb-2">העלה חזרה</h4>
                <p className="text-sm text-[#6B6573] font-sans">שמור את הקובץ והעלה אותו למערכת</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
              <div className="text-sm text-[#6B6573] font-sans">
                <strong className="font-semibold text-[#D4AF37]">טיפ:</strong> הקובץ כולל דף "הוראות" עם הסבר מפורט על כל עמודה ודוגמאות למילוי
              </div>
            </div>
          </div>
        )}

        {/* Guests Preview */}
        {guests.length > 0 && (
          <div className="glass p-8 rounded-2xl shadow-modern animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-[#2D2A32]">
                רשימת אורחים ({guests.length})
              </h3>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                + הוסף אורח
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gradient-to-r from-[#6D28D9]/10 to-[#BE185D]/10">
                  <tr>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">שם</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">טלפון</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">צד</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">סטטוס</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">אורחים</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-[#6D28D9]/10 hover:bg-[#6D28D9]/5 transition-colors">
                      <td className="px-4 py-3 font-sans font-medium text-[#2D2A32]">{guest.name}</td>
                      <td className="px-4 py-3 text-[#6B6573] font-sans">{guest.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          guest.relationship === 'צד א' ? 'bg-[#6D28D9]/10 text-[#6D28D9]' :
                          guest.relationship === 'צד ב' ? 'bg-[#BE185D]/10 text-[#BE185D]' :
                          'bg-[#D4AF37]/10 text-[#D4AF37]'
                        }`}>
                          {guest.relationship || 'משותף'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {guest.rsvpStatus === 'accepted' ? (
                          <span className="text-[#87A878] font-semibold">אישר</span>
                        ) : guest.rsvpStatus === 'declined' ? (
                          <span className="text-red-500 font-semibold">סירב</span>
                        ) : guest.rsvpStatus === 'invited' ? (
                          <span className="text-[#6D28D9]">הוזמן</span>
                        ) : (
                          <span className="text-[#D4AF37]">ממתין</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#6D28D9]">{1 + (guest.plusOne || 0)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(guest)}
                            className="text-[#6D28D9] hover:text-[#BE185D] p-1 transition-colors"
                            title="ערוך אורח"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id, guest.name)}
                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                            title="מחק אורח"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && guests.length === 0 && (
          <div className="glass p-8 rounded-2xl shadow-modern text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D28D9] mx-auto mb-4"></div>
            <p className="text-[#6B6573]">טוען אורחים...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && guests.length === 0 && (
          <div className="glass p-8 rounded-2xl shadow-modern text-center">
            <div className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/20 rounded-2xl inline-block mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D2A32] mb-2">אין אורחים עדיין</h3>
            <p className="text-[#6B6573] font-sans mb-4">הורד את התבנית, מלא את רשימת האורחים והעלה את הקובץ</p>
            <button
              onClick={openAddModal}
              className="btn-primary mx-auto"
            >
              + הוסף אורח ראשון
            </button>
          </div>
        )}
      </main>

      {/* Add/Edit Guest Modal */}
      {(showAddModal || editingGuest) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <h2 className="text-2xl font-serif font-bold text-[#2D2A32] mb-6 text-center">
              {editingGuest ? 'עריכת אורח' : 'הוספת אורח חדש'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name - Required */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  שם מלא <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all"
                  placeholder="ישראל ישראלי"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all"
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  אימייל
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  צד
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value as 'צד א' | 'צד ב' | 'משותף' }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all"
                >
                  <option value="משותף">משותף</option>
                  <option value="צד א">צד א</option>
                  <option value="צד ב">צד ב</option>
                </select>
              </div>

              {/* Plus One */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  מספר מלווים
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.plusOne}
                  onChange={(e) => setFormData(prev => ({ ...prev, plusOne: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all"
                />
                <p className="mt-1 text-xs text-[#6B6573]">סה&quot;כ אורחים: {1 + formData.plusOne}</p>
              </div>

              {/* RSVP Status */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  סטטוס אישור
                </label>
                <select
                  value={formData.rsvpStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, rsvpStatus: e.target.value as 'pending' | 'invited' | 'accepted' | 'declined' }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all"
                >
                  <option value="pending">ממתין</option>
                  <option value="invited">הוזמן</option>
                  <option value="accepted">אישר הגעה</option>
                  <option value="declined">סירב</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                  הערות
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#6D28D9]/20 bg-white text-[#2D2A32] focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all resize-none"
                  rows={3}
                  placeholder="הערות נוספות..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-[#6D28D9]/30 text-[#6D28D9] rounded-xl font-semibold hover:bg-[#6D28D9]/5 transition-all"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      שומר...
                    </span>
                  ) : (
                    editingGuest ? 'שמור שינויים' : 'הוסף אורח'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

