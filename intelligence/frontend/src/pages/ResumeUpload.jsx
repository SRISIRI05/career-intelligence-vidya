import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import GlassCard from '../components/GlassCard';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload only PDF or DOCX file formats.');
      return;
    }
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file && !rawText.trim()) {
      setError('Please provide a resume file or paste your resume text.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('raw_text', rawText);
    }

    try {
      const res = await api.post('/resume/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Save parsed data in session storage to pass to analysis screen
      sessionStorage.setItem('latest_analysis', JSON.stringify(res.data));
      navigate('/resume-analysis');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Resume scanning failed. Check your file content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Resume Scanner</h1>
        <p className="text-slate-400 text-sm">Upload your resume to calculate your ATS rating, extract skill tags, and detect gaps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false}>
            {error && (
              <div className="p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                  ${dragging ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 bg-white/5'}
                  ${file ? 'border-emerald-500 bg-emerald-500/5' : 'hover:border-white/20'}
                `}
              >
                <input
                  type="file"
                  id="resume-file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                  disabled={loading}
                />
                <label htmlFor="resume-file" className="cursor-pointer space-y-4 block">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-slate-400">
                    {file ? (
                      <FileText size={32} className="text-emerald-400" />
                    ) : (
                      <Upload size={32} className="text-primary-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {file ? file.name : 'Drag & Drop Resume File'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Click to replace` : 'Supports PDF and DOCX formats up to 5MB'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest my-2">Or Paste Resume Text Below</div>

              {/* Text Area */}
              <div>
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (e.target.value.trim() && file) setFile(null); // Reset file if user types
                  }}
                  disabled={loading || !!file}
                  rows={6}
                  placeholder="Paste your plain text resume content here if you don't have a PDF/DOCX file ready..."
                  className="glass-input w-full p-4 rounded-xl text-sm leading-relaxed"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (!file && !rawText.trim())}
                className="w-full py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-xl shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Analyzing Resume Content...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Scan and Score Resume</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Info Guide Card */}
        <div>
          <GlassCard hoverEffect={false} className="h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-white border-b border-white/5 pb-3">ATS Guidelines</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span>
                  <span>Avoid graphical tables or multi-column grids which confuse scanners.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span>
                  <span>Standardize header tags (e.g. Work Experience, Education, Projects).</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span>
                  <span>List exact tool strings (e.g. React.js, Python, PostgreSQL) to pass keyword filters.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span>
                  <span>Keep dates clean and readable. Use simple month/year formats.</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-6 border-t border-white/5 mt-6 text-xs text-slate-500 flex items-center gap-2">
              <CheckCircle size={14} className="text-primary-400" />
              <span>Secured backend encryption</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
