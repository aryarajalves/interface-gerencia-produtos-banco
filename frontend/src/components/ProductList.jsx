import { useState } from 'react';

export default function ProductList({ products, onEdit, onDelete }) {
    const [confirmingId, setConfirmingId] = useState(null);

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400">
                <p>Nenhum produto encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col group">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-100 line-clamp-1" title={product.nome}>
                            {product.nome}
                        </h3>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2">
                            {product.categoria || 'Sem categoria'}
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-emerald-400 my-2">
                        {product.preco !== undefined && product.preco !== null
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)
                            : 'R$ --'}
                    </p>

                    <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
                        {product.descricao}
                    </p>

                    <div className="flex gap-2 flex-wrap mb-4">
                        {product.tags && product.tags.length > 0 && product.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full border border-slate-600/50">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-sm mb-4 pt-4 border-t border-slate-700/50">
                        <span className="text-slate-400">Estoque</span>
                        <span className={`font-medium ${product.estoque > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {product.estoque} un.
                        </span>
                    </div>

                    <div className="flex gap-2 mt-auto">
                        {confirmingId === product.id ? (
                            <>
                                <button
                                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition font-medium text-sm"
                                    onClick={() => onDelete(product.id)}
                                >
                                    Confirmar?
                                </button>
                                <button
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition font-medium text-sm"
                                    onClick={() => setConfirmingId(null)}
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm shadow-lg shadow-blue-900/20"
                                    onClick={() => onEdit(product)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition font-medium text-sm"
                                    onClick={() => setConfirmingId(product.id)}
                                    title="Excluir"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
