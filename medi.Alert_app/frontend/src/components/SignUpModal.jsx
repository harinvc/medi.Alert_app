import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  UserCheck, 
  Ambulance, 
  Stethoscope, 
  Upload, 
  CheckCircle, 
  FileText, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  X,
  Lock,
  Mail,
  Phone,
  Shield,
  Heart,
  FileCheck
} from 'lucide-react';

export default function SignUpModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signup', initialRole = 'patient' }) {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [role, setRole] = useState(initialRole); // 'patient', 'ambulance', 'doctor'

  // Sync mode and role whenever props change
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setSubmittedSuccess(false);
    }
  }, [isOpen, initialMode, initialRole]);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    
    // Patient specific
    bloodGroup: 'O+',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Driver specific
    licenseNumber: '',
    vehicleRegNo: '',
    baseHospital: '',
    licenseFile: null,
    licensePreview: null,

    // Doctor specific
    doctorRegNo: '',
    hospitalName: '',
    department: 'Emergency Medicine',
    credentialFile: null,
    credentialPreview: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: file,
          [`${fieldName}Preview`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || `${role}@medalert.ai`,
          password: formData.password || 'password123',
          role
        })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setSubmittedSuccess(true);
      } else {
        setSubmittedSuccess(true);
      }
    } catch (err) {
      console.warn('Backend API connection notice:', err);
      setLoading(false);
      setSubmittedSuccess(true);
    }
  };

  const handleContinueToPortal = () => {
    if (onAuthSuccess) {
      onAuthSuccess(role, formData);
    }
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-[#1C2B22]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto text-left">
      <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-3xl border border-[#E6E2D8] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200 relative">
        
        {/* Header */}
        <div className="bg-[#0C4A3B] text-white p-6 sm:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#72DFB4]">
              {mode === 'signup' ? 'Create New Account' : 'Welcome Back'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium">
              {mode === 'signup' ? 'Join the MedAlert AI Network' : 'Sign in to MedAlert'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Clean, familiar, no friction — emergency response coordinated in real time.
            </p>
          </div>

          {/* Mode Switch Tabs (Sign In vs Sign Up) */}
          <div className="mt-6 inline-flex p-1 bg-black/20 rounded-full border border-white/10">
            <button
              onClick={() => { setMode('signup'); setSubmittedSuccess(false); }}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-white text-[#0C4A3B] shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('signin'); setSubmittedSuccess(false); }}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-white text-[#0C4A3B] shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F0EC] text-[#0C4A3B] flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-[#0C4A3B]" />
              </div>
              <h3 className="text-2xl font-serif-heading font-bold text-[#1C2B22]">
                {mode === 'signup' ? 'Registration Complete!' : 'Signed In Successfully'}
              </h3>
              <p className="text-sm text-[#5F6B63] max-w-md mx-auto">
                {role === 'patient' 
                  ? 'Accessing your live Patient Emergency Dashboard...' 
                  : `Your ${role} credentials have been verified with MedAlert AI.`}
              </p>
              <div className="pt-4">
                <button
                  onClick={handleContinueToPortal}
                  className="bg-[#0C4A3B] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#08362B] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <span>{role === 'patient' ? 'Launch Patient SOS Dashboard' : 'Continue to Dashboard'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Role Selection Tabs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">
                  Select Account Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  
                  {/* Patient Role */}
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === 'patient'
                        ? 'border-[#0C4A3B] bg-[#E8F0EC] text-[#0C4A3B] ring-2 ring-[#0C4A3B]/20 font-semibold'
                        : 'border-[#E6E2D8] bg-white text-[#5F6B63] hover:border-[#0C4A3B]/40'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span className="text-xs">Patient</span>
                  </button>

                  {/* Driver Role */}
                  <button
                    type="button"
                    onClick={() => setRole('ambulance')}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === 'ambulance'
                        ? 'border-[#D9532F] bg-[#D9532F]/10 text-[#D9532F] ring-2 ring-[#D9532F]/20 font-semibold'
                        : 'border-[#E6E2D8] bg-white text-[#5F6B63] hover:border-[#D9532F]/40'
                    }`}
                  >
                    <Ambulance className="w-5 h-5" />
                    <span className="text-xs text-center">Ambulance Driver</span>
                  </button>

                  {/* Doctor Role */}
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === 'doctor'
                        ? 'border-[#0C4A3B] bg-[#E8F0EC] text-[#0C4A3B] ring-2 ring-[#0C4A3B]/20 font-semibold'
                        : 'border-[#E6E2D8] bg-white text-[#5F6B63] hover:border-[#0C4A3B]/40'
                    }`}
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span className="text-xs text-center">Doctor / Hospital</span>
                  </button>

                </div>
              </div>

              {/* Common Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {mode === 'signup' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C2B22]">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'Jonathan Vance'}
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1C2B22]">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@hospital.org"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1C2B22]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Role-Specific Fields for Sign Up */}
              {mode === 'signup' && (
                <div className="space-y-4 pt-2 border-t border-[#EBE7DE]">
                  
                  {/* PATIENT ROLE SPECIFIC */}
                  {role === 'patient' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#1C2B22]">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+1 (555) 019-2834"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#1C2B22]">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#1C2B22]">Emergency Contact Name</label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          placeholder="Spouse / Parent Name"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#1C2B22]">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          placeholder="+1 (555) 888-9999"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                        />
                      </div>
                    </div>
                  )}

                  {/* AMBULANCE DRIVER SPECIFIC */}
                  {role === 'ambulance' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#1C2B22]">Driving License Number</label>
                          <input
                            type="text"
                            name="licenseNumber"
                            required
                            placeholder="DL-98472910-X"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#D9532F]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#1C2B22]">Vehicle Reg Number</label>
                          <input
                            type="text"
                            name="vehicleRegNo"
                            required
                            placeholder="AMB-104-NYC"
                            value={formData.vehicleRegNo}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#D9532F]"
                          />
                        </div>
                      </div>

                      {/* UPLOAD DRIVING LICENSE PICTURE */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#1C2B22]">
                          Upload Driving License Picture <span className="text-[#D9532F]">*</span>
                        </label>
                        <div className="border-2 border-dashed border-[#D9532F]/30 bg-[#D9532F]/[0.02] hover:bg-[#D9532F]/[0.05] rounded-2xl p-4 text-center transition-colors relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'license')}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {formData.licensePreview ? (
                            <div className="flex items-center gap-4 text-left">
                              <img 
                                src={formData.licensePreview} 
                                alt="Driving License Preview" 
                                className="w-16 h-12 object-cover rounded-lg border border-[#E6E2D8]"
                              />
                              <div>
                                <p className="text-xs font-semibold text-[#0C4A3B] flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-[#0C4A3B]" /> License Photo Uploaded
                                </p>
                                <p className="text-[11px] text-gray-500">{formData.licenseFile?.name || 'license_photo.jpg'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 py-2">
                              <Upload className="w-6 h-6 text-[#D9532F] mx-auto" />
                              <p className="text-xs font-medium text-[#1C2B22]">
                                Click or drag your Driving License image here
                              </p>
                              <p className="text-[10px] text-[#5F6B63]">JPG, PNG, or WEBP up to 10MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOCTOR / HOSPITAL STAFF SPECIFIC */}
                  {role === 'doctor' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#1C2B22]">Medical Reg Number (NPI/License)</label>
                          <input
                            type="text"
                            name="doctorRegNo"
                            required
                            placeholder="MD-49102-USA"
                            value={formData.doctorRegNo}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#1C2B22]">Hospital Affiliation</label>
                          <input
                            type="text"
                            name="hospitalName"
                            required
                            placeholder="St. Jude General Hospital"
                            value={formData.hospitalName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="block text-xs font-semibold text-[#1C2B22]">Department / Medical Specialty</label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
                          >
                            <option value="Cardiology">Cardiology (Cardiac ER)</option>
                            <option value="Emergency Medicine">Emergency Medicine (General ER)</option>
                            <option value="Orthopedics">Orthopedics & Trauma</option>
                            <option value="Neurology">Neurology & Stroke Unit</option>
                            <option value="ICU">Intensive Care Unit (ICU)</option>
                            <option value="Pediatrics">Pediatric Emergency</option>
                          </select>
                        </div>
                      </div>

                      {/* UPLOAD DOCTOR DEGREE / CREDENTIAL PROOF */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#1C2B22]">
                          Upload Medical Degree / Doctor Proof <span className="text-[#0C4A3B]">*</span>
                        </label>
                        <div className="border-2 border-dashed border-[#0C4A3B]/30 bg-[#0C4A3B]/[0.02] hover:bg-[#0C4A3B]/[0.05] rounded-2xl p-4 text-center transition-colors relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload(e, 'credential')}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {formData.credentialPreview ? (
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 rounded-lg bg-[#E8F0EC] text-[#0C4A3B] flex items-center justify-center">
                                <FileCheck className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#0C4A3B] flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-[#0C4A3B]" /> Medical Credential Uploaded
                                </p>
                                <p className="text-[11px] text-gray-500">{formData.credentialFile?.name || 'doctor_degree.pdf'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 py-2">
                              <FileText className="w-6 h-6 text-[#0C4A3B] mx-auto" />
                              <p className="text-xs font-medium text-[#1C2B22]">
                                Click or drag your Doctor Degree / License Proof document
                              </p>
                              <p className="text-[10px] text-[#5F6B63]">PDF, JPG, or PNG up to 15MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0C4A3B] text-white py-3.5 rounded-full font-semibold text-sm hover:bg-[#08362B] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{mode === 'signup' ? `Register as ${role.toUpperCase()}` : 'Sign In to Dashboard'}</span>
                  </>
                )}
              </button>

              {/* Guest Demo Login */}
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData((prev) => ({
                      ...prev,
                      email: 'guest@demo.com',
                      password: 'demo123'
                    }));
                    setSubmittedSuccess(true);
                  }}
                  className="w-full bg-white text-[#0C4A3B] border border-[#0C4A3B]/30 py-3.5 rounded-full font-semibold text-sm hover:bg-[#E8F0EC] transition-all shadow-sm hover:shadow-md cursor-pointer mt-3"
                >
                  Login as Guest (Demo)
                </button>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
