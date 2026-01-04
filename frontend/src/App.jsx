import { useState, useEffect, useMemo } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import Login from './components/Login'
import UpdatePassword from './components/UpdatePassword'
import { supabase } from './supabaseClient'

// API URL CONFIG
// API URL CONFIG
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/products';

function App() {
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentProduct, setCurrentProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // Auth State
  const [session, setSession] = useState(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    // 1. Checar Hash da URL imediatamente ao carregar
    const hash = window.location.hash

    // Tratamento de erros (Link expirado, etc)
    if (hash && hash.includes('error_code')) {
      console.log("Erro no Hash:", hash)
      if (hash.includes('otp_expired')) {
        toast.error("Link expirado ou já utilizado. Solicite um novo.")
      } else {
        toast.error("Erro ao verificar o link de convite.")
      }

      // CRITICAL FIX: Se der erro, forçamos o recarregamento na raiz para limpar tudo
      setTimeout(() => {
        window.location.href = window.location.origin
      }, 2000)
      return
    }

    // Detectar fluxo de convite ou recuperação
    const isInviteOrRecovery = hash && (hash.includes('type=invite') || hash.includes('type=recovery'))
    if (isInviteOrRecovery) {
      setIsPasswordRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event)
      setSession(session)

      // Reforço: checar evento específico do Supabase
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // UI States
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ orderBy: 'id', direction: 'asc' })

  // Validate Sort Config on change
  useEffect(() => {
    fetchProducts()
  }, [sortConfig]) // Refetch when sort changes

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = `${API_URL}?order_by=${sortConfig.orderBy}&direction=${sortConfig.direction}`
      const response = await fetch(url)

      if (response.status === 429) throw new Error('429')
      if (!response.ok) throw new Error('Falha na conexão')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      if (error.message.includes("429")) {
        setError("Muitas requisições. Por favor, aguarde 1 minuto para tentar novamente.")
      } else {
        setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
      }
      toast.error("Erro de conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  // Derived State (Memoized)
  const categories = useMemo(() => {
    const rawCategories = products.map(p => p.categoria).filter(Boolean)
    const uniqueCats = [...new Set(rawCategories)]
    return ['Todas', ...uniqueCats]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products

    // 1. Filter by Category
    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.categoria === selectedCategory)
    }

    // 2. Filter by Search Term (Name Only)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter(p => p.nome.toLowerCase().includes(lowerTerm))
    }

    return result
  }, [products, selectedCategory, searchTerm])

  // Auto-switch to 'Todas' if selected category is empty
  useEffect(() => {
    if (selectedCategory !== 'Todas' && !categories.includes(selectedCategory)) {
      setSelectedCategory('Todas')
    }
  }, [categories, selectedCategory])

  // Handlers
  const handleDownloadTemplate = () => {
    const csvContent = "nome;categoria;descricao;tags;preco;estoque\nExemplo Produto;Bebidas;Descrição do produto;tag1,tag2;10.50;100";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (product) => {
    try {
      const method = product.id ? 'PUT' : 'POST'
      const url = product.id ? `${API_URL}/${product.id}` : API_URL

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(product)
      })

      if (!response.ok) {
        // Tentar pegar mensagem detalhada do backend
        const errorData = await response.json().catch(() => null)

        if (response.status === 401 || response.status === 403) {
          throw new Error("Você não tem permissão para realizar esta ação.")
        }

        // Erro 422 = Validação do Pydantic (formato diferente)
        if (response.status === 422 && errorData?.detail) {
          // Pydantic retorna array de erros
          if (Array.isArray(errorData.detail)) {
            const traduzirCampo = (campo) => {
              const traducoes = {
                'nome': 'Nome',
                'preco': 'Preço',
                'estoque': 'Estoque',
                'categoria': 'Categoria',
                'descricao': 'Descrição'
              }
              return traducoes[campo] || campo
            }

            const traduzirMensagem = (msg) => {
              // Pydantic V1
              if (msg.includes('ensure this value is greater than')) return 'deve ser maior que 0'
              if (msg.includes('ensure this value has at least')) return 'é muito curto'
              if (msg.includes('ensure this value has at most')) return 'é muito longo'

              // Pydantic V2
              if (msg.includes('Input should be greater than')) return 'deve ser maior que 0'
              if (msg.includes('Input should be less than')) return 'deve ser menor que o permitido'
              if (msg.includes('String should have at least')) return 'é muito curto'
              if (msg.includes('String should have at most')) return 'é muito longo'

              // Comuns
              if (msg.includes('field required')) return 'é obrigatório'
              if (msg.includes('value is not a valid')) return 'valor inválido'
              if (msg.includes('string type expected')) return 'deve ser um texto'

              return msg // Se não tiver tradução, retorna original
            }

            const errors = errorData.detail.map(err => {
              const campo = traduzirCampo(err.loc?.[1] || err.loc?.[0] || 'campo')
              const mensagem = traduzirMensagem(err.msg)
              return `${campo} ${mensagem}`
            }).join('; ')
            throw new Error(errors)
          }
        }

        if (response.status === 400 && errorData?.detail) {
          // Erro de validação customizado (ex: nome duplicado)
          throw new Error(errorData.detail)
        }

        // Outros erros
        throw new Error(errorData?.detail || 'Erro na requisição')
      }

      setShowForm(false)
      setCurrentProduct(null)
      fetchProducts()
      toast.success(product.id ? 'Produto atualizado!' : 'Produto criado!')
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Você não tem permissão para realizar esta ação.")
        }
        throw new Error('Erro ao deletar')
      }
      fetchProducts()
      toast.success("Produto excluído!")
    } catch (error) {
      console.error("Erro ao deletar:", error)
      toast.error(error.message)
    }
  }

  const startEdit = (product) => {
    setCurrentProduct(product)
    setShowForm(true)
  }

  const startNew = () => {
    setCurrentProduct(null)
    setShowForm(true)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <Login />
      </div>
    )
  }

  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <UpdatePassword onPasswordUpdated={() => setIsPasswordRecovery(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Gerente de Produtos
        </h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium shadow-lg shadow-red-900/20"
        >
          Sair
        </button>
      </div>

      {!showForm ? (
        <>
          {/* Action Bar */}
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <span className="text-slate-400 font-semibold whitespace-nowrap">
                {filteredProducts.length} produto(s)
              </span>

              <input
                type="text"
                className="flex-1 md:w-64 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                value={`${sortConfig.orderBy}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [orderBy, direction] = e.target.value.split('-')
                  setSortConfig({ orderBy, direction })
                }}
              >
                <option value="id-asc" className="bg-slate-900 text-white">Padrão</option>
                <option value="price-desc" className="bg-slate-900 text-white">Maior Preço</option>
                <option value="price-asc" className="bg-slate-900 text-white">Menor Preço</option>
                <option value="stock-desc" className="bg-slate-900 text-white">Maior Estoque</option>
                <option value="stock-asc" className="bg-slate-900 text-white">Menor Estoque</option>
                <option value="name-asc" className="bg-slate-900 text-white">A-Z</option>
                <option value="name-desc" className="bg-slate-900 text-white">Z-A</option>
              </select>

              <select
                className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                onClick={handleDownloadTemplate}
                title="Baixar Planilha Modelo"
              >
                <span>📥</span> Modelo
              </button>

              <label className="cursor-pointer px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    const toastId = toast.loading('Importando produtos...');

                    try {
                      const { data: { session } } = await supabase.auth.getSession();

                      const response = await fetch(`${API_URL}/upload/`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session?.access_token}`
                        },
                        body: formData
                      });

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(result.detail || 'Erro na importação');
                      }

                      toast.success(`Importação: ${result.details.created} criados, ${result.details.updated} atualizados!`, { id: toastId });
                      fetchProducts();
                    } catch (error) {
                      console.error(error);
                      toast.error(`Erro: ${error.message}`, { id: toastId });
                    } finally {
                      e.target.value = null;
                    }
                  }}
                />
                <span>📂</span> Importar CSV
              </label>

              <button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                onClick={startNew}
              >
                <span>+</span> Novo Produto
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current mb-4"></div>
              <p>Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 bg-red-900/10 rounded-2xl border border-red-900/20">
              <p className="text-xl font-bold mb-2">Erro</p>
              <p>{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                onClick={fetchProducts}
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <ProductList
              products={filteredProducts}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      ) : (
        <ProductForm
          productToEdit={currentProduct}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          availableCategories={categories.filter(c => c !== 'Todas')}
        />
      )}
    </div>
  )
}

export default App
