import { useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function Login() {
    const [loadingLogin, setLoadingLogin] = useState(false)
    const [loadingForgot, setLoadingForgot] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoadingLogin(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            toast.success('Login realizado com sucesso!')

        } catch (error) {
            toast.error(error.message || 'Erro ao fazer login')
            console.error(error)
        } finally {
            setLoadingLogin(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error('Por favor, digite seu email primeiro.')
            return
        }
        setLoadingForgot(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            })
            if (error) throw error
            toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.')
        } catch (error) {
            toast.error('Erro ao enviar email: ' + error.message)
        } finally {
            setLoadingForgot(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Gerente de Produtos
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <input
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
                        <div className="relative">
                            <input
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loadingLogin}
                    >
                        {loadingLogin ? 'Entrando...' : 'Entrar'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={loadingForgot}
                            className="text-sm text-blue-400 hover:text-blue-300 transition underline underline-offset-4 disabled:opacity-50"
                        >
                            {loadingForgot ? 'Enviando...' : 'Esqueci minha senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
