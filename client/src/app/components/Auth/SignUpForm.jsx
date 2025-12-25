// client/src/app/components/Auth/SignupForm.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/lib/auth';

const researchInterests = [
    'Quantum Computing', 'Machine Learning', 'Artificial Intelligence',
    'Neuroscience', 'Renewable Energy', 'Biotechnology',
    'Data Science', 'Robotics', 'Climate Science',
    'Materials Science', 'Genetics', 'Astrophysics',
    'Cybersecurity', 'Blockchain', 'Internet of Things'
];

export default function SignupForm() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        userType: 'student',
        fullName: '',
        email: '',
        institution: '',
        fieldOfStudy: '',
        password: '',
        confirmPassword: '',
        interests: [],
        notifications: {
            newResearch: true,
            friendRequests: true,
            discussionUpdates: true,
            weeklyDigest: false
        },
        termsAccepted: false
    });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        text: 'Password strength'
    });
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // Password strength checker
    useEffect(() => {
        if (!formData.password) {
            setPasswordStrength({ score: 0, text: 'Password strength' });
            return;
        }

        let strength = 0;
        if (formData.password.length >= 8) strength++;
        if (/[A-Z]/.test(formData.password)) strength++;
        if (/[0-9]/.test(formData.password)) strength++;
        if (/[^A-Za-z0-9]/.test(formData.password)) strength++;

        const texts = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
        setPasswordStrength({
            score: strength,
            text: texts[strength]
        });
    }, [formData.password]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox' && name.startsWith('notification_')) {
            const notificationType = name.replace('notification_', '');
            setFormData(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [notificationType]: checked
                }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => {
            if (prev.interests.includes(interest)) {
                return {
                    ...prev,
                    interests: prev.interests.filter(i => i !== interest)
                };
            } else {
                return {
                    ...prev,
                    interests: [...prev.interests, interest]
                };
            }
        });
    };

    const handleVerificationCodeChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;
        
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.fullName.trim()) {
                    alert('Please enter your full name');
                    return false;
                }
                if (!formData.email.includes('@') || !formData.email.includes('.')) {
                    alert('Please enter a valid email address');
                    return false;
                }
                return true;
            
            case 2:
                if (formData.password.length < 6) {
                    alert('Password must be at least 6 characters');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    alert('Passwords do not match');
                    return false;
                }
                return true;
            
            case 3:
                if (!formData.termsAccepted) {
                    alert('Please agree to the Terms of Service');
                    return false;
                }
                return true;
            
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;
        
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
            
            // Update progress bar
            const progress = ((currentStep) / 4) * 100;
            document.getElementById('stepProgress').style.width = `${progress}%`;
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            
            // Update progress bar
            const progress = ((currentStep - 2) / 4) * 100;
            document.getElementById('stepProgress').style.width = `${progress}%`;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await AuthService.signup(formData);
            if (result.success) {
                router.push('/dashboard');
            }
        } catch (error) {
            alert(error.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="form-step active">
                        <div className="form-group">
                            <label htmlFor="userType">I am a</label>
                            <div className="role-selector">
                                {[
                                    { id: 'typeStudent', value: 'student', icon: 'fas fa-graduation-cap', label: 'Student' },
                                    { id: 'typeTeacher', value: 'teacher', icon: 'fas fa-chalkboard-teacher', label: 'Teacher/Professor' },
                                    { id: 'typeResearcher', value: 'researcher', icon: 'fas fa-flask', label: 'Researcher' }
                                ].map(role => (
                                    <div key={role.id}>
                                        <input
                                            type="radio"
                                            name="userType"
                                            id={role.id}
                                            value={role.value}
                                            checked={formData.userType === role.value}
                                            onChange={handleInputChange}
                                            hidden
                                        />
                                        <label htmlFor={role.id} className="role-option">
                                            <i className={role.icon}></i>
                                            <span>{role.label}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">
                                <i className="fas fa-user"></i> Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@university.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <div className="input-hint">Use your academic email for verification</div>
                        </div>

                        <button type="button" className="btn btn-primary btn-block" onClick={nextStep}>
                            Continue <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className="form-step active">
                        <div className="form-group">
                            <label htmlFor="institution">
                                <i className="fas fa-university"></i> Institution
                            </label>
                            <input
                                type="text"
                                id="institution"
                                name="institution"
                                placeholder="e.g., MIT, Stanford, etc."
                                value={formData.institution}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fieldOfStudy">
                                <i className="fas fa-book"></i> Field of Study
                            </label>
                            <select
                                id="fieldOfStudy"
                                name="fieldOfStudy"
                                value={formData.fieldOfStudy}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select your field</option>
                                <option value="computer-science">Computer Science</option>
                                <option value="engineering">Engineering</option>
                                <option value="medicine">Medicine & Health Sciences</option>
                                <option value="business">Business & Economics</option>
                                <option value="natural-sciences">Natural Sciences</option>
                                <option value="social-sciences">Social Sciences</option>
                                <option value="humanities">Humanities</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <i className="fas fa-lock"></i> Password
                            </label>
                            <div className="password-input">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="password-strength">
                                <div className={`strength-bar strength-${passwordStrength.score}`}></div>
                                <span className="strength-text">{passwordStrength.text}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                <i className="fas fa-lock"></i> Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="step-navigation">
                            <button type="button" className="btn btn-outline" onClick={prevStep}>
                                <i className="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" className="btn btn-primary" onClick={nextStep}>
                                Continue <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="form-step active">
                        <div className="form-group">
                            <label>
                                <i className="fas fa-heart"></i> Research Interests
                            </label>
                            <div className="interests-grid">
                                {researchInterests.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`interest-btn ${formData.interests.includes(interest) ? 'selected' : ''}`}
                                        onClick={() => handleInterestToggle(interest)}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notificationPrefs">
                                <i className="fas fa-bell"></i> Notification Preferences
                            </label>
                            <div className="checkbox-group">
                                {[
                                    { id: 'newResearch', label: 'New research in my fields' },
                                    { id: 'friendRequests', label: 'Friend requests' },
                                    { id: 'discussionUpdates', label: 'Discussion updates' },
                                    { id: 'weeklyDigest', label: 'Weekly digest' }
                                ].map(notif => (
                                    <label key={notif.id} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name={`notification_${notif.id}`}
                                            checked={formData.notifications[notif.id]}
                                            onChange={handleInputChange}
                                        />
                                        {notif.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleInputChange}
                                    required
                                />
                                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                            </label>
                        </div>

                        <div className="step-navigation">
                            <button type="button" className="btn btn-outline" onClick={prevStep}>
                                <i className="fas fa-arrow-left"></i> Back
                            </button>
                            <button type="button" className="btn btn-primary" onClick={nextStep}>
                                Continue <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="form-step active">
                        <div className="verification-step">
                            <div className="verification-icon">
                                <i className="fas fa-envelope-open-text"></i>
                            </div>
                            <h3>Verify Your Email</h3>
                            <p>We&apos;ve sent a verification code to:</p>
                            <p className="verification-email">{formData.email}</p>
                            
                            <div className="verification-input">
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="code-input"
                                        id={`code-${index}`}
                                        value={digit}
                                        onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                                    />
                                ))}
                            </div>
                            
                            <div className="step-navigation">
                                <button type="button" className="btn btn-outline" onClick={prevStep}>
                                    <i className="fas fa-arrow-left"></i> Back
                                </button>
                                <button type="button" className="btn btn-primary" onClick={nextStep}>
                                    Verify Email
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="form-step active">
                        <div className="welcome-step">
                            <div className="welcome-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h3>Welcome to AcademVault!</h3>
                            <p>Your account has been successfully created.</p>
                            <p className="welcome-text">
                                Get ready to explore, discover, and collaborate on groundbreaking research.
                            </p>
                            
                            <div className="welcome-features">
                                <div className="welcome-feature">
                                    <i className="fas fa-search"></i>
                                    <span>Start searching research materials</span>
                                </div>
                                <div className="welcome-feature">
                                    <i className="fas fa-users"></i>
                                    <span>Connect with fellow researchers</span>
                                </div>
                                <div className="welcome-feature">
                                    <i className="fas fa-folder"></i>
                                    <span>Organize your research collection</span>
                                </div>
                            </div>
                            
                            <button 
                                type="button" 
                                className="btn btn-primary btn-block" 
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Processing...
                                    </>
                                ) : (
                                    'Go to Dashboard'
                                )}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="signup-steps">
                <div className="step-indicator">
                    {[1, 2, 3, 4, 5].map(step => (
                        <div 
                            key={step} 
                            className={`step ${currentStep >= step ? 'active' : ''}`}
                            data-step={step}
                        >
                            <div className="step-number">{step}</div>
                            <span className="step-label">
                                {step === 1 && 'Account'}
                                {step === 2 && 'Profile'}
                                {step === 3 && 'Preferences'}
                                {step === 4 && 'Verify'}
                                {step === 5 && 'Complete'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="step-progress">
                    <div className="progress-bar" id="stepProgress"></div>
                </div>
            </div>

            {renderStep()}
        </>
    );
}