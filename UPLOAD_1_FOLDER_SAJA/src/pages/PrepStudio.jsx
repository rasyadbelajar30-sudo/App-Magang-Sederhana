import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, FolderLock, MessageSquareQuote } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { CvEditor } from '../components/prep/CvEditor';
import { CvPreview } from '../components/prep/CvPreview';
import { SuratPengantarPreview } from '../components/prep/SuratPengantarPreview';
import { DocumentVault } from '../components/prep/DocumentVault';
import { Flashcard } from '../components/prep/Flashcard';
import { spring } from '../lib/constants';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function PrepStudio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refresh, updateUserState } = useApp();
  const { toast } = useToast();

  const activeTab = searchParams.get('tab') || 'cv';

  const [previewMode, setPreviewMode] = useState('CV');
  const [savingVault, setSavingVault] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    education_level: 'Mahasiswa',
    institution_name: '',
    major: '',
    grade_or_semester: '',
    gpa_or_score: 0,
    city: '',
    bio: '',
    portfolio_url: '',
    skills: [],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        education_level: user.education_level || 'Mahasiswa',
        institution_name: user.institution_name || '',
        major: user.major || '',
        grade_or_semester: user.grade_or_semester || '',
        gpa_or_score: user.gpa_or_score ?? 0,
        city: user.city || '',
        bio: user.bio || '',
        portfolio_url: user.portfolio_url || '',
        skills: Array.isArray(user.skills) ? user.skills : [],
      });
    }
  }, [user?.id]);

  const handleSaveToVault = async (docType) => {
    setSavingVault(true);
    try {
      // Save profile first to ensure generator uses latest state
      await api.put('/user', {
        full_name: formData.full_name,
        phone: formData.phone,
        education_level: formData.education_level,
        institution_name: formData.institution_name,
        major: formData.major,
        grade_or_semester: formData.grade_or_semester,
        gpa_or_score: Number(formData.gpa_or_score) || 0,
        city: formData.city,
        bio: formData.bio,
        portfolio_url: formData.portfolio_url,
      });

      const res = await api.post('/documents/generate', { doc_type: docType });
      updateUserState(res);
      await refresh();

      toast({
        type: 'success',
        title: `${docType === 'CV' ? 'CV ATS-Friendly' : 'Surat Pengantar'} Tersimpan ke Brankas!`,
        desc: 'Berkas telah terverifikasi dan siap dilampirkan saat melamar.',
        xp: res.xp,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Gagal menyimpan ke Brankas',
        desc: err.message,
      });
    } finally {
      setSavingVault(false);
    }
  };

  const tabs = [
    { id: 'cv', label: 'CV & Surat Studio', icon: FileText },
    { id: 'dokumen', label: 'Brankas Dokumen (6)', icon: FolderLock },
    { id: 'interview', label: 'Flashcard Interview (12)', icon: MessageSquareQuote },
  ];

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Studio Tabs with layoutId indicator */}
      <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSearchParams({ tab: t.id })}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="prep-studio-tab"
                  transition={spring}
                  className="absolute inset-0 bg-brand-gradient rounded-xl shadow-md"
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-white' : 'text-slate-500'}`} />
              <span
                className={`relative z-10 ${
                  active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'cv' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <CvEditor
              formData={formData}
              setFormData={setFormData}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              onSaveToVault={handleSaveToVault}
              savingVault={savingVault}
            />
          </div>
          <div className="lg:col-span-6 sticky top-24">
            {previewMode === 'CV' ? (
              <CvPreview data={{ ...formData, skills: user?.skills || formData.skills }} />
            ) : (
              <SuratPengantarPreview data={formData} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'dokumen' && <DocumentVault />}

      {activeTab === 'interview' && <Flashcard />}
    </PageTransition>
  );
}
