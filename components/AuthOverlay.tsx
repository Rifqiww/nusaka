'use client'

import { useState } from 'react'
import { auth } from '../lib/firebase'
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth'
import { Loader2, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function AuthOverlay() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password)
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name })
                }
            }
        } catch (err: any) {
            console.error(err)
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Email atau password salah.')
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email sudah terdaftar.')
            } else if (err.code === 'auth/invalid-email') {
                setError('Format email tidak valid.')
            } else if (err.code === 'auth/weak-password') {
                setError('Password terlalu lemah (min. 6 karakter).')
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div 
            className="relative w-full max-w-lg p-2 group pointer-events-auto animate-in fade-in zoom-in duration-500"
            style={{ fontFamily: 'var(--font-nanum-pen)' }}
        >
            <div className="relative flex flex-col items-center p-8 md:p-12 bg-[#FFF9E6] rounded-[40px] border-[5px] border-[#374151] shadow-[10px_10px_0_#374151] overflow-hidden">
                {/* Dot Grid Background */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#374151 2px, transparent 2px)', backgroundSize: '16px 16px' }}
                />

                {/* Decorative floating elements */}
                <div className="absolute top-4 right-6 opacity-40 z-10">
                    <Sparkles className="w-12 h-12 text-[#D97706] rotate-12" />
                </div>
                <div className="absolute bottom-4 left-6 opacity-30 z-10">
                    <User className="w-10 h-10 text-[#374151] -rotate-12" />
                </div>
                
                <div className="mb-10 text-center relative z-10">
                    <h2 className="text-6xl md:text-8xl text-[#374151] mb-2 tracking-tight drop-shadow-sm">
                        {isLogin ? 'Masuk Dunia' : 'Jurnal Baru'}
                    </h2>
                    <p className="text-[#374151]/60 font-sans text-xs uppercase tracking-[0.3em] font-black">
                        {isLogin ? 'Buka catatan petualanganmu' : 'Tuliskan namamu di sejarah Nusaka'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 relative z-10">
                    {!isLogin && (
                        <div className="relative group/input">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-[#374151]/40 group-focus-within/input:text-[#D97706] transition-colors">
                                <User className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                placeholder="Panggil namamu..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-16 pr-5 py-5 bg-white border-[4px] border-[#374151] rounded-2xl text-[#374151] placeholder-[#374151]/30 focus:outline-none focus:bg-[#FEF08A]/10 transition-all font-sans text-lg shadow-[4px_4px_0_#374151]"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-[#374151]/40 group-focus-within/input:text-[#D97706] transition-colors">
                            <Mail className="w-6 h-6" />
                        </div>
                        <input
                            type="email"
                            placeholder="Alamat Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-16 pr-5 py-5 bg-white border-[4px] border-[#374151] rounded-2xl text-[#374151] placeholder-[#374151]/30 focus:outline-none focus:bg-[#FEF08A]/10 transition-all font-sans text-lg shadow-[4px_4px_0_#374151]"
                            required
                        />
                    </div>

                    <div className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-[#374151]/40 group-focus-within/input:text-[#D97706] transition-colors">
                            <Lock className="w-6 h-6" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Sandi Rahasia"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-16 pr-14 py-5 bg-white border-[4px] border-[#374151] rounded-2xl text-[#374151] placeholder-[#374151]/30 focus:outline-none focus:bg-[#FEF08A]/10 transition-all font-sans text-lg shadow-[4px_4px_0_#374151]"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#374151]/30 hover:text-[#374151] transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-[#D97706] text-xl font-bold text-center bg-[#FEF3C7] py-3 rounded-2xl border-[3px] border-[#D97706]/30 animate-shake">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group/btn relative mt-6 w-full py-5 bg-[#68D77B] hover:bg-[#5bbd6b] disabled:bg-gray-200 border-[5px] border-[#374151] text-[#374151] rounded-2xl font-black flex items-center justify-center gap-4 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-[6px_6px_0_#374151] active:shadow-none"
                    >
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <>
                                <span className="text-5xl">
                                    {isLogin ? 'Masuk Dunia' : 'Jadi Penjelajah'}
                                </span>
                                <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 flex flex-col items-center gap-6 relative z-10 w-full">
                    <div className="flex items-center gap-4 w-full">
                        <div className="h-[2px] flex-1 bg-[#374151]/10 border-b border-dashed border-[#374151]/20" />
                        <span className="text-[#374151]/40 text-sm font-sans tracking-[0.2em] font-bold uppercase">Halaman Lain</span>
                        <div className="h-[2px] flex-1 bg-[#374151]/10 border-b border-dashed border-[#374151]/20" />
                    </div>
                    
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-3xl text-[#374151] hover:text-[#D97706] transition-all font-black decoration-[#D97706]/50 underline underline-offset-8"
                    >
                        {isLogin ? 'Belum punya jurnal? Buat baru!' : 'Sudah punya jurnal? Buka di sini!'}
                    </button>
                </div>
            </div>
        </div>
    )
}
