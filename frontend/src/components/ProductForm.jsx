import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ProductForm({ productToEdit, onSave, onCancel, availableCategories }) {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [categoria, setCategoria] = useState('');
    const [estoque, setEstoque] = useState('');
    const [tags, setTags] = useState('');

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (productToEdit) {
            setNome(productToEdit.nome || '');
            setDescricao(productToEdit.descricao || '');
            setPreco(productToEdit.preco || '');
            setCategoria(productToEdit.categoria || '');
            setEstoque(productToEdit.estoque || '');
            setTags(productToEdit.tags ? productToEdit.tags.join(', ') : '');
        }
    }, [productToEdit]);

    const validate = () => {
        const newErrors = {};

        if (!nome.trim()) newErrors.nome = 'Nome é obrigatório.';
        if (parseFloat(preco) < 0) newErrors.preco = 'O preço não pode ser negativo.';
        if (!preco && preco !== 0) newErrors.preco = 'Preço é obrigatório.';
        if (parseInt(estoque) < 0) newErrors.estoque = 'O estoque não pode ser negativo.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Corrija os erros antes de salvar.");
            return;
        }

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        onSave({
            id: productToEdit?.id,
            nome,
            descricao,
            preco: parseFloat(preco),
            categoria,
            estoque: parseInt(estoque) || 0,
            tags: tagsArray
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Produto</label>
                        <input
                            type="text"
                            className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${errors.nome ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'}`}
                            value={nome}
                            onChange={(e) => {
                                setNome(e.target.value);
                                if (errors.nome) setErrors({ ...errors, nome: null });
                            }}
                            placeholder="Ex: Açaí 500ml"
                        />
                        {errors.nome && <span className="text-red-400 text-sm mt-1 block">{errors.nome}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${errors.preco ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'}`}
                                value={preco}
                                onChange={(e) => {
                                    setPreco(e.target.value);
                                    if (errors.preco) setErrors({ ...errors, preco: null });
                                }}
                                placeholder="0.00"
                            />
                            {errors.preco && <span className="text-red-400 text-sm mt-1 block">{errors.preco}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Estoque</label>
                            <input
                                type="number"
                                className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${errors.estoque ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'}`}
                                value={estoque}
                                onChange={(e) => {
                                    setEstoque(e.target.value);
                                    if (errors.estoque) setErrors({ ...errors, estoque: null });
                                }}
                                placeholder="0"
                            />
                            {errors.estoque && <span className="text-red-400 text-sm mt-1 block">{errors.estoque}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
                        <input
                            type="text"
                            list="category-options"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            placeholder="Selecione ou digite..."
                        />
                        <datalist id="category-options">
                            {availableCategories && availableCategories.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Tags (separadas por vírgula)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Ex: fitness, vegano, zero lactose"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                        <textarea
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            rows="3"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Detalhes do produto..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium shadow-lg shadow-blue-900/20"
                        >
                            {productToEdit ? 'Salvar Alterações' : 'Adicionar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
