import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Star, Search, Building2, Users, ChevronDown, ChevronUp, X, Sparkles, ShieldCheck } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';
import api from '../utils/api';

const cityColors = {
  Ayodhya:           { from: 'from-amber-500', to: 'to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Faizabad:          { from: 'from-amber-500', to: 'to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Basti:             { from: 'from-blue-600',   to: 'to-indigo-600', light: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  Gonda:             { from: 'from-emerald-500',to: 'to-teal-600',  light: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200' },
  Lucknow:           { from: 'from-purple-500', to: 'to-violet-600',light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Siddharth Nagar': { from: 'from-teal-500',   to: 'to-cyan-600',   light: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  Bahraich:          { from: 'from-pink-500',   to: 'to-rose-600',   light: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200' },
  Srawasti:          { from: 'from-yellow-500', to: 'to-amber-600', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  Gonti:             { from: 'from-indigo-500', to: 'to-blue-600',   light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Ambedkarnagar:     { from: 'from-red-500',    to: 'to-rose-600',   light: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  'Santkabir Nagar': { from: 'from-cyan-500',   to: 'to-blue-600',   light: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200' },
};

const getColor = (city) => cityColors[city] || { from: 'from-blue-600', to: 'to-indigo-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };

function BranchCard({ branch, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = getColor(branch.city);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 9) * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col"
    >
      <div className={`bg-gradient-to-r ${color.from} ${color.to} p-4 relative overflow-hidden text-white`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-white text-xs font-black shrink-0">
                {branch.branchNumber}
              </span>
              {branch.isMain && (
                <span className="flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 shadow-xs">
                  <Star className="w-3 h-3 fill-slate-950" /> HEAD OFFICE
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-sm leading-snug group-hover:text-amber-200 transition-colors line-clamp-2">
              {branch.name}
            </h3>
          </div>
          <div className="shrink-0 px-2.5 py-0.5 bg-white/20 rounded-md text-[11px] font-bold whitespace-nowrap">
            {branch.city}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="flex items-start gap-2.5">
          <div className={`w-7 h-7 ${color.light} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
            <MapPin className={`w-3.5 h-3.5 ${color.text}`} />
          </div>
          <p className="text-gray-700 text-xs leading-relaxed font-normal">{branch.address}</p>
        </div>

        {branch.staffDetails?.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mt-auto">
            {branch.staffDetails.length === 1 ? (
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50/80 rounded-xl border border-gray-100">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-xs leading-tight">{branch.staffDetails[0].name}</div>
                  {branch.staffDetails[0].role && <div className="text-blue-600 text-[10px] font-semibold">{branch.staffDetails[0].role}</div>}
                  {branch.staffDetails[0].phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <a href={`tel:${branch.staffDetails[0].phone.split(/[,&]/)[0].trim()}`}
                        className="text-[10px] text-gray-700 hover:text-blue-600 transition-colors font-mono font-semibold">
                        {branch.staffDetails[0].phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setExpanded(!expanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${color.light} ${color.border} border`}>
                  <div className="flex items-center gap-2">
                    <Users className={`w-3.5 h-3.5 ${color.text}`} />
                    <span className={`text-xs font-bold ${color.text}`}>Staff Contact ({branch.staffDetails.length})</span>
                  </div>
                  {expanded ? <ChevronUp className={`w-3.5 h-3.5 ${color.text}`} /> : <ChevronDown className={`w-3.5 h-3.5 ${color.text}`} />}
                </button>
                {expanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-2">
                    {branch.staffDetails.map((s, j) => (
                      <div key={j} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-colors">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-blue-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-xs leading-tight">{s.name}</div>
                          {s.role && <div className="text-blue-600 text-[10px] font-semibold">{s.role}</div>}
                          {s.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <a href={`tel:${s.phone.split(/[,&]/)[0].trim()}`}
                                className="text-[10px] text-gray-700 hover:text-blue-600 transition-colors font-mono font-semibold">
                                {s.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RollLookup() {
  const [roll, setRoll] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!roll.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await api.get(`/auth/student-info/${roll.trim()}`);
      setResult(data.student);
    } catch (err) {
      setError(err.response?.data?.message || 'Student record not found');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-5 mb-8">
      <h3 className="font-black text-gray-900 text-sm mb-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-blue-600" /> Student Verification & Roll Lookup
      </h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="Enter Enrollment No. (e.g. KCI20260004)"
          className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all font-medium" />
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-60">
          {loading ? 'Searching...' : 'Search'}
        </button>
        {result && <button type="button" onClick={() => { setResult(null); setRoll(''); }} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"><X className="w-4 h-4 text-gray-500" /></button>}
      </form>
      {error && <p className="mt-2 text-xs text-red-600 font-semibold">{error}</p>}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-slate-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-xs">
              {result.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-sm">{result.name}</div>
              <div className="text-xs font-mono font-bold text-blue-600">{result.rollNumber}</div>
            </div>
            <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
              result.isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>{result.isApproved ? 'Approved ✓' : 'Pending'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              ['Email', result.email],
              ['Phone', result.phone || '—'],
              ['Course', result.courseName || '—'],
              ['Branch', result.branchName || '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
                <div className="text-xs font-bold text-gray-800 mt-0.5 truncate">{value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    // Fetch from both sources: Branch collection (static directory) + approved branch users
    Promise.all([
      api.get('/branches').then(r => r.data.branches || []).catch(() => []),
      api.get('/branch/public').then(r => r.data.branches || []).catch(() => []),
    ]).then(([staticBranches, userBranches]) => {
      // Normalize static Branch model
      const fromStatic = staticBranches.map((b, i) => ({
        _id: b._id,
        branchNumber: b.branchNumber || (i + 1),
        name: b.name || '',
        city: b.city || '',
        address: b.address || '',
        isMain: b.isMain || false,
        phone: b.phone || '',
        staffDetails: b.staffDetails || [],
        _source: 'static',
      }));
      // Normalize branch User accounts (admin-created branches)
      const fromUsers = userBranches.map((b, i) => ({
        _id: b._id,
        branchNumber: staticBranches.length + i + 1,
        name: b.branchName || b.name || '',
        city: b.branchCity || '',
        address: b.branchAddress || '',
        isMain: false,
        phone: b.branchPhone || b.phone || '',
        staffDetails: b.name ? [{ name: b.name, role: 'Branch Manager', phone: b.branchPhone || b.phone || '' }] : [],
        _source: 'user',
      }));
      // Deduplicate: skip user-branches whose name already exists in static list
      const staticNames = new Set(fromStatic.map(b => b.name.toLowerCase().trim()));
      const uniqueUserBranches = fromUsers.filter(b => b.name && !staticNames.has(b.name.toLowerCase().trim()));
      setBranches([...fromStatic, ...uniqueUserBranches]);
    }).finally(() => setLoadingBranches(false));
  }, []);

  const cities = ['All', ...Array.from(new Set(branches.map(b => b.city).filter(Boolean))).sort()];

  const filtered = branches.filter(b => {
    const q = search.toLowerCase();
    return (b.name.toLowerCase().includes(q) || (b.address || '').toLowerCase().includes(q) || (b.city || '').toLowerCase().includes(q))
      && (selectedCity === 'All' || b.city === selectedCity);
  });

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">

      {/* Hero Header */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-4 text-amber-300 shadow-md">
            <Building2 className="w-4 h-4 text-amber-400" /> 30+ Branches Across Uttar Pradesh
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
            Our <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">Branch Network</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Find a Keerti Computer Institute branch near you with official contact & address details
          </p>
        </motion.div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="LOCATIONS" title="Branch Directory" subtitle="All KCI branches with address and staff details" />

          <RollLookup />

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-5 mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by branch name, city, or address..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs sm:text-sm font-medium" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {cities.map(city => {
                const color = city === 'All' ? null : getColor(city);
                return (
                  <button key={city} onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedCity === city
                        ? city === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : `bg-gradient-to-r ${color.from} ${color.to} text-white border-transparent shadow-md`
                        : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}>
                    {city}
                    {city !== 'All' && <span className="ml-1 opacity-70">({branches.filter(b => b.city === city).length})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {loadingBranches ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">{branches.length === 0 ? 'No branches found.' : 'No branches match your search.'}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mb-6">
                Showing <strong className="text-gray-900 font-bold">{filtered.length}</strong> branch{filtered.length !== 1 ? 'es' : ''}
                {selectedCity !== 'All' && <span> in <strong className="text-blue-600 font-bold">{selectedCity}</strong></span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((branch, i) => <BranchCard key={branch._id} branch={branch} index={i} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
