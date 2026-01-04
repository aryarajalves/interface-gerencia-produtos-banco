import { useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function Login() {
    const [loadingLogin, setLoadingLogin] = useState(false)
    const [loadingForgot, setLoadingForgot] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

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
                        <input
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua senha"
                            required
                        />
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
