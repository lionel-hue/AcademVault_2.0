// client/src/app/signup/page.jsx - UPDATED WITHOUT FRAMER-MOTION
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthService from '@/lib/auth';
import { useModal } from '@/app/components/UI/Modal/ModalContext';

export default function SignupPage() {
  const router = useRouter();
  const { alert, confirm, prompt } = useModal();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: 'student',
    fullName: '',
    email: '',
    institution: '',
    fieldOfStudy: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = async (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          await alert({
            title: 'Missing Information',
            message: 'Please enter your full name',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
          await alert({
            title: 'Invalid Email',
            message: 'Please enter a valid email address',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      
      case 2:
        if (formData.password.length < 6) {
          await alert({
            title: 'Weak Password',
            message: 'Password must be at least 6 characters long',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          await alert({
            title: 'Password Mismatch',
            message: 'Passwords do not match. Please try again.',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.termsAccepted) {
          await alert({
            title: 'Terms Required',
            message: 'Please accept the terms and conditions to continue',
            variant: 'warning',
            confirmText: 'Got it'
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await AuthService.signup(formData);
      if (result.success) {
        await alert({
          title: 'Welcome to AcademVault! 🎉',
          message: 'Your account has been successfully created. You can now access all features.',
          variant: 'success',
          confirmText: 'Go to Dashboard'
        });
        router.push('/dashboard');
      }
    } catch (error) {
      await alert({
        title: 'Signup Failed',
        message: error.message || 'Unable to create account. Please try again.',
        variant: 'danger',
        confirmText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const steps = [
      {
        number: 1,
        title: 'Account Type',
        icon: 'fas fa-user-plus'
      },
      {
        number: 2,
        title: 'Credentials',
        icon: 'fas fa-lock'
      },
      {
        number: 3,
        title: 'Terms',
        icon: 'fas fa-file-contract'
      },
      {
        number: 4,
        title: 'Verification',
        icon: 'fas fa-envelope'
      },
      {
        number: 5,
        title: 'Complete',
        icon: 'fas fa-check-circle'
      }
    ];

    return (
      <div className="space-y-8">
        {/* Step Progress */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step.number 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-400'
              }`}>
                <i className={step.icon}></i>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 ${currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-800'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Account Type */}
          {currentStep === 1 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Create Your Account</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'student', icon: 'fas fa-graduation-cap', label: 'Student', desc: 'Access course materials and research' },
                  { id: 'teacher', icon: 'fas fa-chalkboard-teacher', label: 'Teacher', desc: 'Share resources and collaborate' },
                  { id: 'researcher', icon: 'fas fa-flask', label: 'Researcher', desc: 'Advanced tools and publications' },
                ].map((type) => (
                  <label key={type.id} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="userType"
                      value={type.id}
                      checked={formData.userType === type.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 group-hover:scale-105 ${
                      formData.userType === type.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        formData.userType === type.id 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gray-700'
                      }`}>
                        <i className={`${type.icon} text-white text-lg`}></i>
                      </div>
                      <h4 className="font-bold text-white mb-2">{type.label}</h4>
                      <p className="text-sm text-gray-400">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-user text-blue-400"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-envelope text-blue-400"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@university.edu"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Credentials */}
          {currentStep === 2 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Account Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <i className="fas fa-university text-blue-400"></i>
                      Institution
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="e.g., MIT, Stanford"
                      className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <i className="fas fa-book text-blue-400"></i>
                      Field of Study
                    </label>
                    <select
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    >
                      <option value="">Select your field</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="engineering">Engineering</option>
                      <option value="medicine">Medicine & Health</option>
                      <option value="business">Business</option>
                      <option value="sciences">Natural Sciences</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-lock text-blue-400"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Password strength</span>
                        <span className={`${
                          passwordStrength >= 75 ? 'text-green-400' : 
                          passwordStrength >= 50 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {passwordStrength >= 75 ? 'Strong' : passwordStrength >= 50 ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength >= 75 ? 'bg-green-500' : 
                            passwordStrength >= 50 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <i className="fas fa-lock text-blue-400"></i>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat your password"
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Terms */}
          {currentStep === 3 && (
            <>
              <h3 className="text-2xl font-bold text-white mb-6">Terms & Conditions</h3>
              
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-white mb-4">AcademVault Terms of Service</h4>
                <div className="space-y-3 text-gray-400 text-sm">
                  <p>Welcome to AcademVault! By creating an account, you agree to our terms:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>You will use the platform for academic purposes only</li>
                    <li>You respect intellectual property rights of others</li>
                    <li>You maintain the confidentiality of your account</li>
                    <li>You comply with all applicable laws and regulations</li>
                    <li>You are responsible for content you upload or share</li>
                  </ul>
                  <p className="mt-4">By checking the box below, you acknowledge that you have read and agree to these terms.</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700 cursor-pointer group hover:border-gray-600 transition-colors">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    formData.termsAccepted 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent' 
                      : 'border-gray-600 group-hover:border-gray-500'
                  }`}>
                    {formData.termsAccepted && (
                      <i className="fas fa-check text-white text-xs"></i>
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-white">I agree to the Terms of Service and Privacy Policy</span>
                  <p className="text-sm text-gray-400 mt-1">Required to create your account</p>
                </div>
              </label>
            </>
          )}

          {/* Step 4: Verification */}
          {currentStep === 4 && (
            <>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-envelope-open-text text-3xl text-blue-400"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Verify Your Email</h3>
                <p className="text-gray-400 mb-2">We&apos;ve sent a 6-digit code to:</p>
                <p className="font-medium text-blue-400 mb-8">{formData.email}</p>
                
                <div className="flex justify-center gap-3 mb-8">
                  {[1,2,3,4,5,6].map(i => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="w-14 h-14 text-center text-2xl font-bold bg-gray-900/50 backdrop-blur-sm border-2 border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  ))}
                </div>
                
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Resend Code?',
                      message: 'Send a new verification code to your email?',
                      variant: 'default'
                    });
                    if (confirmed) {
                      await alert({
                        title: 'Code Sent',
                        message: 'A new verification code has been sent to your email.',
                        variant: 'success'
                      });
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Resend code
                </button>
              </div>
            </>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-check-circle text-4xl text-green-400"></i>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Account Created! 🎉</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Welcome to AcademVault! Your account has been successfully created and is ready to use.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700">
                    <i className="fas fa-search text-blue-400 text-xl mb-2"></i>
                    <p className="text-sm text-gray-300">Start searching research</p>
                  </div>
                  <div className="p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700">
                    <i className="fas fa-users text-purple-400 text-xl mb-2"></i>
                    <p className="text-sm text-gray-300">Connect with researchers</p>
                  </div>
                  <div className="p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700">
                    <i className="fas fa-folder text-green-400 text-xl mb-2"></i>
                    <p className="text-sm text-gray-300">Organize your work</p>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full max-w-md mx-auto group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-800">
          {currentStep > 1 && currentStep < 5 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-700/50 transition-all duration-300"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          )}
          
          {currentStep < 5 && (
            <button
              onClick={nextStep}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              {currentStep === 4 ? 'Verify & Continue' : 'Continue'}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Illustration (Now on left) */}
          <div className="order-2 lg:order-1 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
              
              {/* Main Illustration Container */}
              <div className="relative bg-gray-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl overflow-hidden">
                {/* Registration Illustration */}
                <div className="relative h-80 mb-8">
                  {/* Floating Elements */}
                  <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl rotate-12 animate-float">
                    <i className="fas fa-user-plus absolute inset-0 flex items-center justify-center text-blue-400 text-xl"></i>
                  </div>
                  
                  <div className="absolute top-24 right-12 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: '0.3s' }}>
                    <i className="fas fa-graduation-cap absolute inset-0 flex items-center justify-center text-purple-400 text-2xl"></i>
                  </div>
                  
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl flex items-center justify-center">
                      <i className="fas fa-rocket text-white text-3xl"></i>
                    </div>
                  </div>
                  
                  {/* Connecting Dots */}
                  <svg className="absolute inset-0 w-full h-full">
                    {[...Array(8)].map((_, i) => (
                      <circle
                        key={i}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                        r="2"
                        fill="#3b82f6"
                        opacity="0.3"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </svg>
                </div>
                
                {/* Benefits */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white mb-4">Join Our Community</h4>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-database text-blue-400"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">10M+ Resources</h4>
                      <p className="text-sm text-gray-400">Access millions of academic papers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user-friends text-green-400"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Global Network</h4>
                      <p className="text-sm text-gray-400">Connect with researchers worldwide</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chart-line text-purple-400"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">AI Insights</h4>
                      <p className="text-sm text-gray-400">Smart recommendations and analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form (Now on right) */}
          <div className="order-1 lg:order-2 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl">
                    <i className="fas fa-graduation-cap text-white text-xl"></i>
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AcademVault
                </h1>
              </div>
              
              <h2 className="text-4xl font-bold text-white mb-4">
                Create Account
                <div className="text-lg font-normal text-gray-400 mt-2">
                  Join our research community in just 5 steps
                </div>
              </h2>
            </div>

            {/* Form Container */}
            <div className="bg-gray-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
              {renderStep()}
              
              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-center text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}