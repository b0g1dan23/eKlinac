'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaGraduationCap } from 'react-icons/fa';
import { MdSchool, MdFamilyRestroom } from 'react-icons/md';
import { PiStudentDuotone } from 'react-icons/pi';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userType, setUserType] = useState<'teacher' | 'parent' | 'student'>('teacher');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', { ...formData, userType, isLogin });
    };

    const userTypes = [
        {
            type: 'teacher' as const,
            label: 'Teacher',
            icon: FaGraduationCap,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50 border-blue-200',
            activeColor: 'bg-blue-500 text-white border-blue-500'
        },
        {
            type: 'parent' as const,
            label: 'Parent',
            icon: MdFamilyRestroom,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 border-purple-200',
            activeColor: 'bg-purple-500 text-white border-purple-500'
        },
        {
            type: 'student' as const,
            label: 'Student',
            icon: PiStudentDuotone,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50 border-green-200',
            activeColor: 'bg-green-500 text-white border-green-500'
        }
    ];

    const currentUserType = userTypes.find(ut => ut.type === userType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-4 shadow-lg">
                        <MdSchool size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome to <span className="text-orange-500">CodeKids</span>
                    </h1>
                    <p className="text-gray-600">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Toggle Login/Register */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${isLogin
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${!isLogin
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* User Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            I am a:
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {userTypes.map(({ type, label, icon: Icon, bgColor, activeColor }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setUserType(type)}
                                    className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${userType === type ? activeColor : `${bgColor} hover:shadow-md`
                                        }`}
                                >
                                    <Icon size={24} className={`mx-auto mb-1 ${userType === type ? 'text-white' : 'text-gray-600'}`} />
                                    <div className={`text-xs font-medium ${userType === type ? 'text-white' : 'text-gray-700'}`}>
                                        {label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* First Name & Last Name (Register only) */}
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        required={!isLogin}
                                    />
                                </div>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="email"
                                name="email"
                                placeholder={userType === 'student' ? 'Username' : 'Email address'}
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>

                        {/* Confirm Password (Register only) */}
                        {!isLogin && (
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    required={!isLogin}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        )}

                        {/* Remember me / Forgot password */}
                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600">
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg bg-gradient-to-r ${currentUserType?.color} shadow-md`}
                        >
                            {isLogin ? `Sign In as ${currentUserType?.label}` : `Create ${currentUserType?.label} Account`}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <div><strong>Teacher:</strong> bogdan@codekids.com / teacher123</div>
                            <div><strong>Parent:</strong> mike@email.com / parent123</div>
                            <div><strong>Student:</strong> alice_student / demo123</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;