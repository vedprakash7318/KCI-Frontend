import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, CheckCircle, AlertCircle,
  Calendar, MapPin, Clock, BookOpen,
  Save, FileText, RefreshCw,
  Plus, Trash2, ChevronDown, History, X,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EXAM_TYPES = ['Theory', 'Practical', 'Theory + Practical', 'Online', 'Viva'];
const EMPTY_ROW  = () => ({ course: '', examDate: '', reportingTime: '', examType: '' });

const DEFAULT_COURSES = [
  'Advance Diploma in Computer Application (ADCA)',
  'Diploma in Computer Application (DCA)',
  'Course On Computer Concept (CCC from NIELIT)',
  'Tally Specialist Course With GST',
  'Certificate In Tally A/c With GST (CIT)',
  'Certificate In Fundamental (CIF)',
  'Certificate in Computer Application (CCA)',
  'Certificate In Office Package & Tally A/C (COPT)',
  'Desktop Publishing (DTP)',
  'Computer Teacher Training Course',
  'Certificate In Computer Hardware (CICH)',
  'Python & Web Development',
  'JAVA, VB.net, ASP.net, PHP',
  'C, C++ Programming',
  'Graphic Design & Video Editing',
  'Computer Typing (Hindi + English)',
  'Multimedia Animation Course (N-Mass)',
  'O Level (NIELIT)',
  'BCA / BBA / MCA / MBA / PGDCA & More',
];

export default function AdminAdmitCard() {
  const [enabled,      setEnabled]      = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  const [saved,        setSaved]        = useState(null);
  const [viewSchedule, setViewSchedule] = useState(null); // holds a history entry to view
  const [history,      setHistory]      = useState([]);

  // dropdown data
  const [branches, setBranches] = useState([]);
  const [courses,  setCourses]  = useState([]);

  // form state
  const [examCenter,    setExamCenter]    = useState('');
  const [customCenter,  setCustomCenter]  = useState('');
  const [reportingTime, setReportingTime] = useState('9:15 AM');
  const [examType,      setExamType]      = useState('Theory + Practical');
  const [instructions,  setInstructions]  = useState('Please arrive 15 minutes early and carry a valid ID card. Late arrivals may not be permitted.');
  const [rows,          setRows]          = useState([EMPTY_ROW()]);

  // ── Load all data ──
  useEffect(() => {
    Promise.all([
      api.get('/admit-card/setting'),
      api.get('/admit-card/schedule'),
      api.get('/admit-card/schedule/options'),
      api.get('/admit-card/schedule/history'),
    ]).then(([settingR, scheduleR, optionsR, historyR]) => {
      setEnabled(settingR.data.enabled || false);
      setBranches(optionsR.data.branches || []);
      setCourses(optionsR.data.courses   || []);
      setHistory(historyR.data.history   || []);

      const s = scheduleR.data.schedule;
      if (s) {
        setSaved(s);
        setExamCenter(s.examCenter    || '');
        setReportingTime(s.reportingTime || '9:15 AM');
        setExamType(s.examType        || 'Theory + Practical');
        setInstructions(s.instructions || 'Please arrive 15 minutes early and carry a valid ID card. Late arrivals may not be permitted.');
        setRows(s.courseSchedules?.length ? s.courseSchedules.map(r => ({
          course:        r.course        || '',
          examDate:      r.examDate ? r.examDate.slice(0, 10) : '',
          reportingTime: r.reportingTime || '',
          examType:      r.examType      || '',
        })) : [EMPTY_ROW()]);
      }
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  // ── Toggle ──
  const toggle = async () => {
    setToggling(true);
    try {
      const v = !enabled;
      await api.post('/admit-card/toggle', { enabled: v });
      setEnabled(v);
      toast.success(`Admit Card ${v ? 'ENABLED' : 'DISABLED'} on Student Portal`);
    } catch { toast.error('Toggle failed'); }
    setToggling(false);
  };

  // ── Row helpers ──
  const updateRow = (i, field, value) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const addRow    = () => setRows(prev => [...prev, EMPTY_ROW()]);
  const removeRow = i  => setRows(prev => prev.filter((_, idx) => idx !== i));

  // The actual center used (custom overrides dropdown)
  const finalCenter = examCenter === '__custom__' ? customCenter.trim() : examCenter;

  // Combine DB courses and default courses uniquely
  const allCourseOptions = Array.from(
    new Set([
      ...(courses || []).map(c => (typeof c === 'object' ? c.title : c)).filter(Boolean),
      ...DEFAULT_COURSES,
    ])
  );

  // ── Save ──
  const handleSave = async (e) => {
    e.preventDefault();
    const validRows = rows.filter(r => r.course && r.examDate);
    if (!validRows.length) return toast.error('Add at least one course with an exam date.');
    setSaving(true);
    try {
      const { data } = await api.post('/admit-card/schedule', {
        examCenter:    finalCenter,
        reportingTime, examType, instructions,
        courseSchedules: validRows.map(r => ({
          course:        r.course,
          examDate:      r.examDate,
          reportingTime: r.reportingTime || reportingTime,
          examType:      r.examType      || examType,
        })),
      });
      setSaved(data.schedule);
      // Refresh history
      api.get('/admit-card/schedule/history').then(r => setHistory(r.data.history || [])).catch(() => {});
      toast.success('Exam schedule saved successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-gray-900">Admit Card & Exam Schedule</h1>
          <p className="text-xs sm:text-sm text-gray-500">Set course-wise exam dates, exam center, and notify students via email</p>
        </div>
      </div>

      {/* ── Toggle ── */}
      <motion.div layout className={`rounded-2xl border-2 p-5 transition-all ${
        enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
              {enabled ? <Eye className="w-6 h-6 text-green-600" /> : <EyeOff className="w-6 h-6 text-gray-400" />}
            </div>
            <div>
              <p className="font-black text-gray-900">Admit Card Visibility</p>
              <div className="flex items-center gap-2 mt-0.5">
                {enabled
                  ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600 font-semibold text-sm">Visible on Student Portal</span></>
                  : <><AlertCircle className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400 font-semibold text-sm">Hidden from Student Portal</span></>
                }
              </div>
            </div>
          </div>
          <button onClick={toggle} disabled={toggling}
            className={`relative w-14 h-7 rounded-full transition-all focus:outline-none disabled:opacity-60 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
            <motion.div animate={{ x: enabled ? 28 : 4 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md" />
          </button>
        </div>
      </motion.div>

      {/* ── 2-column layout ── */}
      <div className="flex flex-col xl:flex-row gap-6">

      {/* ── LEFT: Schedule Form ── */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white" />
          <h2 className="text-white font-black">Set Exam Schedule</h2>
          {saved && (
            <span className="ml-auto text-xs bg-white/20 text-white px-3 py-1 rounded-full">
              Last saved: {new Date(saved.updatedAt || Date.now()).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">

          {/* ── Global Settings Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Exam Center — Branch Selector */}
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Exam Center
              </label>
              <div className="relative">
                <select value={examCenter} onChange={e => setExamCenter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-9 font-medium text-gray-800">
                  <option value="">-- Select Branch --</option>
                  {branches.map((b, idx) => {
                    const val = typeof b === 'object' ? `${b.name}, ${b.city}` : b;
                    const lbl = typeof b === 'object' ? `${b.name} — ${b.city}` : b;
                    return <option key={idx} value={val}>{lbl}</option>;
                  })}
                  <option value="__custom__">+ Type Custom Center</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              {examCenter === '__custom__' && (
                <input type="text" placeholder="Type exam center name" value={customCenter}
                  onChange={e => setCustomCenter(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 border border-blue-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
              )}
            </div>

            {/* Default Reporting Time */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Default Reporting Time
              </label>
              <input type="text" placeholder="e.g. 9:15 AM" value={reportingTime}
                onChange={e => setReportingTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 font-medium text-gray-800" />
            </div>

            {/* Default Exam Type */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Default Exam Type
              </label>
              <div className="relative">
                <select value={examType} onChange={e => setExamType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-9 font-medium text-gray-800">
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ── Course-wise Schedule Rows ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Course-wise Exam Dates
              </label>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-200">
                <Plus className="w-3.5 h-3.5" /> Add Course Row
              </button>
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 mb-1.5 px-1">
              <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Course</div>
              <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Exam Date</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Time (override)</div>
              <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Type (override)</div>
              <div className="col-span-1" />
            </div>

            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-12 gap-2 mb-2 items-center">

                  {/* Course selector */}
                  <div className="col-span-12 sm:col-span-4 relative">
                    <select value={row.course} onChange={e => updateRow(i, 'course', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-8 font-medium text-gray-800 truncate">
                      <option value="">-- Select Course --</option>
                      {allCourseOptions.map(courseName => (
                        <option key={courseName} value={courseName}>{courseName}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
                  </div>

                  {/* Exam Date */}
                  <div className="col-span-6 sm:col-span-3">
                    <input type="date" value={row.examDate} onChange={e => updateRow(i, 'examDate', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-gray-50 font-medium text-gray-800" />
                  </div>

                  {/* Reporting Time override */}
                  <div className="col-span-3 sm:col-span-2">
                    <input type="text" placeholder={reportingTime} value={row.reportingTime}
                      onChange={e => updateRow(i, 'reportingTime', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-gray-50 font-medium text-gray-800" />
                  </div>

                  {/* Exam Type override */}
                  <div className="col-span-2 sm:col-span-2 relative">
                    <select value={row.examType} onChange={e => updateRow(i, 'examType', e.target.value)}
                      className="w-full px-2 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-gray-50 appearance-none pr-6 font-medium text-gray-800">
                      <option value="">Default</option>
                      {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-3 pointer-events-none" />
                  </div>

                  {/* Delete row */}
                  <div className="col-span-1 flex justify-center">
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
              Time and Type columns are optional — leave blank to use the defaults above.
            </p>
          </div>

          {/* ── Instructions ── */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> Special Instructions
            </label>
            <textarea rows={3} placeholder="Please arrive 15 minutes early and carry a valid ID card. Late arrivals may not be permitted." value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 resize-none font-medium text-gray-800" />
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </form>
      </div>

      {/* ── RIGHT: History Panel ── */}
      <div className="w-full xl:w-80 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4 flex items-center gap-3">
          <History className="w-5 h-5 text-white" />
          <h2 className="text-white font-black">Schedule History</h2>
          <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{history.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <History className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">No history yet</p>
              <p className="text-xs mt-1">Saved schedules will appear here</p>
            </div>
          ) : (
            history.map((entry, i) => (
              <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {entry.examCenter || 'No center'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(entry.savedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">
                      {entry.courseSchedules?.length || 0} course{entry.courseSchedules?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button onClick={() => setViewSchedule(entry)}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-bold transition-all border border-blue-100">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      </div>{/* end 2-col */}

      {/* ── View History Modal ── */}
      <AnimatePresence>
        {viewSchedule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewSchedule(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 flex items-center gap-3">
                <History className="w-5 h-5 text-white" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black truncate">{viewSchedule.examCenter || 'No center'}</p>
                  <p className="text-gray-300 text-xs mt-0.5">
                    Saved: {new Date(viewSchedule.savedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => setViewSchedule(null)}
                  className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Exam Center</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{viewSchedule.examCenter || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Reporting Time</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{viewSchedule.reportingTime || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Exam Type</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{viewSchedule.examType || '—'}</p>
                  </div>
                </div>

                {viewSchedule.instructions && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1">Instructions</p>
                    <p className="text-sm text-blue-800">{viewSchedule.instructions}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Course Schedule ({viewSchedule.courseSchedules?.length || 0})</p>
                  <div className="space-y-2">
                    {(viewSchedule.courseSchedules || []).map((row, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                        <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{row.course}</p>
                          <p className="text-[11px] text-gray-500">
                            {row.examDate ? new Date(row.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            {row.reportingTime ? ` · ${row.reportingTime}` : ''}
                            {row.examType ? ` · ${row.examType}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
