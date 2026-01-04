import { useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function UpdatePassword({ onPasswordUpdated }) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleUpdatePassword = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: password })

      if (error) throw error

      toast.success('Senha atualizada com sucesso!')
      onPasswordUpdated() // Avisa o App que acabou

    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar senha')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Definir Nova Senha
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nova Senha</label>
            <input
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Confirmar Senha</label>
            <input
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a senha"
              required
              minLength={6}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPass"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-900/50"
            />
            <label htmlFor="showPass" className="text-sm cursor-pointer select-none text-slate-300">Mostrar Senha</label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Salvar Nova Senha' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}
