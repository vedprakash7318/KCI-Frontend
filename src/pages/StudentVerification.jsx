import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, GraduationCap, Phone, Mail, MapPin, Calendar,
  Building2, Award, FileText, CheckCircle, XCircle, Shield,
  BookOpen, Clock, Hash, BadgeCheck, Eye, Download, X
} from 'lucide-react';
import api from '../utils/api';

function InfoRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-bold mt-0.5 break-words ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  );
}

function CertificateViewer({ cert, onClose }) {
  const url = cert.certificateFile?.startsWith('http')
    ? cert.certificateFile
    : `${import.meta.env.VITE_API_URL || ''}${cert.certificateFile}`;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-700" />
        </button>
        <img src={url} alt="Certificate" className="w-full rounded-2xl shadow-2xl" />
        <a href={url} download target="_blank" rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Download className="w-4 h-4" /> Download Certificate
        </a>
      </motion.div>
    </div>
  );
}

export default function StudentVerification() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [viewCert, setViewCert] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.get(`/branch/verify-student?q=${encodeURIComponent(q)}`);
      if (data.success && data.student) {
        setResult(data);
      } else {
        setError('No student found with this Form No / Enrollment No / Roll No.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No student found. Please check the number and try again.');
    }
    setLoading(false);
  };

  const s = result?.student;
  const certs = result?.certificates || [];
  const results = result?.results || [];
  const branch = result?.branch;

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black mb-4 shadow-md">
          <Shield className="w-3.5 h-3.5" /> Official Student Verification Portal
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
          Student Verification
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-gray-500 text-sm sm:text-base">
          Enter Form Number, Enrollment Number, or Roll Number to verify student details
        </motion.p>
      </div>

      {/* Search Box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Form No / Enrollment No / Roll No..."
              className="w-full pl-10 pr-4 py-3 text-sm font-medium text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
              autoComplete="off"
            />
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Verify'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          Example: KCI20240001 · KCI-ENR-0001 · KCI-F-HO-0001
        </p>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {s && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto space-y-5">

            {/* Verified Banner */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="text-green-800 font-black text-sm">Student Verified Successfully</p>
                <p className="text-green-600 text-xs">This student is registered with Keerti Computer Institute</p>
              </div>
              <span className={`ml-auto text-xs font-black px-3 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Student Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex items-center gap-4">
                {s.photo ? (
                  <img src={s.photo.startsWith('http') ? s.photo : `${import.meta.env.VITE_API_URL || ''}${s.photo}`}
                    alt={s.name} className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30">
                    <span className="text-2xl font-black text-white">{(s.name || 'S')[0].toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black text-white">{s.name}</h2>
                  <p className="text-blue-200 text-sm font-medium">{s.courseName || 'N/A'}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {s.formNo && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Form: {s.formNo}</span>}
                    {s.enrollmentNumber && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Enroll: {s.enrollmentNumber}</span>}
                    {s.rollNumber && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Roll: {s.rollNumber}</span>}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-5 grid sm:grid-cols-2 gap-x-8">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Personal Details</p>
                  <InfoRow icon={User} label="Student Name" value={s.name} />
                  <InfoRow icon={User} label="Father Name" value={s.fatherName} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={fmt(s.dob)} />
                  <InfoRow icon={Phone} label="Mobile No" value={s.phone} />
                  <InfoRow icon={Mail} label="E-Mail" value={s.email} />
                  <InfoRow icon={MapPin} label="Address" value={s.address} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Course Details</p>
                  <InfoRow icon={Hash} label="Form No" value={s.formNo} highlight />
                  <InfoRow icon={Hash} label="Enrollment No" value={s.enrollmentNumber} highlight />
                  <InfoRow icon={Hash} label="Roll No" value={s.rollNumber} highlight />
                  <InfoRow icon={BookOpen} label="Course" value={s.courseName} />
                  <InfoRow icon={Clock} label="Batch" value={s.batch} />
                  <InfoRow icon={Calendar} label="Joining Date" value={fmt(s.admissionDate)} />
                  <InfoRow icon={GraduationCap} label="College / Institute" value={branch?.branchName || s.branchName || 'Keerti Computer Institute'} />
                </div>
              </div>

              {/* Status Row */}
              <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Status', value: s.isApproved ? 'Confirmed' : 'Pending', ok: s.isApproved },
                  { label: 'Results', value: results.length > 0 ? (results[0].percentage >= 40 ? 'Pass' : 'Fail') : 'N/A', ok: results.length > 0 && results[0].percentage >= 40 },
                  { label: 'Issue Marksheet', value: results.length > 0 ? 'Yes' : 'No', ok: results.length > 0 },
                  { label: 'Issue Certificate', value: certs.length > 0 ? 'Yes' : 'No', ok: certs.length > 0 },
                ].map(({ label, value, ok }) => (
                  <div key={label} className={`rounded-xl p-3 text-center border ${ok ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs text-gray-400 font-semibold">{label}</p>
                    <p className={`text-sm font-black mt-0.5 ${ok ? 'text-green-700' : 'text-gray-500'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Branch Info */}
            {(branch || s.branchName) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Branch / Center Details</p>
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <InfoRow icon={Building2} label="Branch Name" value={branch?.branchName || s.branchName} />
                  <InfoRow icon={MapPin} label="Branch City" value={branch?.branchCity || s.branchCity} />
                  <InfoRow icon={Hash} label="Branch Code" value={branch?.branchCode} highlight />
                  <InfoRow icon={Phone} label="Branch Phone" value={branch?.phone || branch?.branchPhone} />
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" /> Examination Results
                </p>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <div>
                        <p className="text-sm font-black text-gray-800">{r.courseName || s.courseName || 'Course'}</p>
                        <p className="text-xs text-gray-400">{fmt(r.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${r.percentage >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                          {r.percentage != null ? `${r.percentage}%` : '—'}
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.percentage >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.percentage >= 40 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {certs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-blue-500" /> Certificates
                </p>
                <div className="space-y-3">
                  {certs.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border border-blue-100">
                      <div>
                        <p className="text-sm font-black text-gray-800">{c.courseName || s.courseName}</p>
                        <p className="text-xs text-blue-600 font-mono font-bold">{c.certificateNumber || c.certNumber || '—'}</p>
                        <p className="text-xs text-gray-400">{fmt(c.issueDate || c.createdAt)}</p>
                      </div>
                      {c.certificateFile && (
                        <button onClick={() => setViewCert(c)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="text-center text-xs text-gray-400 pb-4">
              <Shield className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
              This verification is issued by Keerti Computer Institute — Official Records
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Lightbox */}
      <AnimatePresence>
        {viewCert && <CertificateViewer cert={viewCert} onClose={() => setViewCert(null)} />}
      </AnimatePresence>
    </div>
  );
}
