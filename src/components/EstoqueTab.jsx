import { useState } from 'react'
import { AlertTriangle, Plus, X, PackageCheck, Pencil, Trash2, Package } from 'lucide-react'

const EMPTY_FORM = { name: '', emoji: '👕', cost: '', price: '', qty: '', category: '' }

export default function EstoqueTab({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateStock }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)      // id do produto sendo editado
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [confirmDeleteId, setConfirmDeleteId] = useState(null) // id do produto aguardando confirmação de exclusão

  const emojis = ['👕', '👖', '👗', '🧥', '👒', '👟', '👜', 'scarf', '🧤', '🩱']

  const lowStock = products.filter(p => p.qty <= 3 && p.qty > 0)
  const outOfStock = products.filter(p => p.qty === 0)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nome obrigatório'
    if (!form.cost || isNaN(form.cost) || Number(form.cost) <= 0) e.cost = 'Custo inválido'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Preço inválido'
    if (form.qty === '' || isNaN(form.qty) || Number(form.qty) < 0) e.qty = 'Quantidade inválida'
    return e
  }

  const openNewForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      emoji: product.emoji,
      cost: String(product.cost),
      price: String(product.price),
      qty: String(product.qty),
      category: product.category,
    })
    setErrors({})
    setShowForm(true)
    setConfirmDeleteId(null)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const data = {
      name: form.name.trim(),
      emoji: form.emoji,
      cost: Number(form.cost),
      price: Number(form.price),
      qty: Number(form.qty),
      category: form.category || 'Geral',
    }

    if (editingId !== null) {
      onUpdateProduct(editingId, data)
    } else {
      onAddProduct(data)
    }

    closeForm()
  }

  const handleDelete = (id) => {
    onDeleteProduct(id)
    setConfirmDeleteId(null)
    if (editingId === id) closeForm()
  }

  const margin = (p) => (((p.price - p.cost) / p.price) * 100).toFixed(0)

  return (
    <div className="tab-scroll">

      {/* Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="alert-section">
          {outOfStock.map(p => (
            <div key={p.id} className="alert-card alert-danger">
              <AlertTriangle size={16} />
              <span><strong>{p.name}</strong> — Sem estoque!</span>
            </div>
          ))}
          {lowStock.map(p => (
            <div key={p.id} className="alert-card alert-warning">
              <AlertTriangle size={16} />
              <span><strong>{p.name}</strong> — Apenas {p.qty} unidade{p.qty > 1 ? 's' : ''}!</span>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="section-header">
        <span className="section-title">📦 Produtos ({products.length})</span>
        <button
          className="btn-add-product"
          onClick={showForm && editingId === null ? closeForm : openNewForm}
        >
          {showForm && editingId === null ? <X size={16} /> : <Plus size={16} />}
          {showForm && editingId === null ? 'Cancelar' : 'Novo'}
        </button>
      </div>

      {/* Add / Edit Product Form */}
      {showForm && (
        <div className="add-form">
          <div className="form-title-row">
            <p className="form-title">
              {editingId !== null ? '✏️ Editar Produto' : '➕ Cadastrar Novo Produto'}
            </p>
            <button className="form-close-btn" onClick={closeForm}>
              <X size={16} />
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Ícone</label>
            <div className="emoji-picker">
              {['👕', '👖', '👗', '🧥', '👒', '👟', '👜', '🧣', '🧤', '🩱'].map(e => (
                <button
                  key={e}
                  className={`emoji-btn ${form.emoji === e ? 'emoji-active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, emoji: e }))}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nome do Produto *</label>
            <input
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Ex: Camiseta Básica"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group form-half">
              <label className="form-label">Custo (R$) *</label>
              <input
                className={`form-input ${errors.cost ? 'input-error' : ''}`}
                type="number"
                placeholder="0,00"
                value={form.cost}
                onChange={e => setForm(prev => ({ ...prev, cost: e.target.value }))}
              />
              {errors.cost && <span className="error-msg">{errors.cost}</span>}
            </div>
            <div className="form-group form-half">
              <label className="form-label">Preço de Venda (R$) *</label>
              <input
                className={`form-input ${errors.price ? 'input-error' : ''}`}
                type="number"
                placeholder="0,00"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
              />
              {errors.price && <span className="error-msg">{errors.price}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-half">
              <label className="form-label">Quantidade *</label>
              <input
                className={`form-input ${errors.qty ? 'input-error' : ''}`}
                type="number"
                placeholder="0"
                value={form.qty}
                onChange={e => setForm(prev => ({ ...prev, qty: e.target.value }))}
              />
              {errors.qty && <span className="error-msg">{errors.qty}</span>}
            </div>
            <div className="form-group form-half">
              <label className="form-label">Categoria</label>
              <input
                className="form-input"
                placeholder="Ex: Blusas"
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>

          {form.cost && form.price && Number(form.price) > 0 && (
            <div className="margin-preview">
              <span>Margem de lucro estimada:</span>
              <span className="margin-value" style={{ color: Number(form.price) > Number(form.cost) ? '#00b894' : '#e17055' }}>
                {(((Number(form.price) - Number(form.cost)) / Number(form.price)) * 100).toFixed(1)}%
              </span>
            </div>
          )}

          <div className="form-actions">
            {editingId !== null && (
              <button
                className="btn-delete-product"
                onClick={() => setConfirmDeleteId(editingId)}
              >
                <Trash2 size={16} />
                Excluir
              </button>
            )}
            <button className="btn-save-product" onClick={handleSubmit}>
              <PackageCheck size={18} />
              {editingId !== null ? 'Salvar Edição' : 'Salvar Produto'}
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Empty State */}
      {products.length === 0 && !showForm && (
        <div className="stock-empty">
          <div className="stock-empty-icon">📦</div>
          <h3>Seu Estoque está Vazio!</h3>
          <p>Cadastre seu primeiro produto para começar a controlar seu negócio e fazer vendas no VendaFácil.</p>
          <button className="btn-add-first-product" onClick={openNewForm}>
            <Plus size={18} /> Cadastrar Meu 1º Produto
          </button>
        </div>
      )}

      {/* Product List */}
      <div className="stock-list">
        {products.map(p => {
          const isLow = p.qty <= 3 && p.qty > 0
          const isOut = p.qty === 0
          const isEditing = editingId === p.id

          return (
            <div key={p.id}>
              <div
                className={`stock-card ${isOut ? 'border-danger' : isLow ? 'border-warning' : ''} ${isEditing ? 'stock-card-editing' : ''}`}
              >
                <div className="stock-emoji">{p.emoji}</div>
                <div className="stock-info">
                  <p className="stock-name">{p.name}</p>
                  <p className="stock-category">{p.category}</p>
                  <div className="stock-prices">
                    <span className="price-cost">Custo: R$ {p.cost.toFixed(2).replace('.', ',')}</span>
                    <span className="price-sep">·</span>
                    <span className="price-sell">Venda: R$ {p.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <span className="margin-pill">Margem {margin(p)}%</span>
                </div>

                <div className="stock-right-col">
                  {/* Stepper */}
                  <div className="qty-stepper">
                    <button className="step-btn" onClick={() => onUpdateStock(p.id, Math.max(0, p.qty - 1))}>−</button>
                    <span className={`step-qty ${isOut ? 'qty-danger' : isLow ? 'qty-warn' : 'qty-good'}`}>{p.qty}</span>
                    <button className="step-btn" onClick={() => onUpdateStock(p.id, p.qty + 1)}>+</button>
                  </div>
                  <span className="qty-label">unid.</span>

                  {/* Action buttons */}
                  <div className="stock-card-actions">
                    <button
                      className={`card-action-btn edit-btn ${isEditing ? 'edit-btn-active' : ''}`}
                      title="Editar produto"
                      onClick={() => isEditing ? closeForm() : openEditForm(p)}
                    >
                      {isEditing ? <X size={13} /> : <Pencil size={13} />}
                    </button>
                    <button
                      className="card-action-btn delete-btn"
                      title="Excluir produto"
                      onClick={() => setConfirmDeleteId(p.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline delete confirmation */}
              {confirmDeleteId === p.id && (
                <div className="delete-confirm">
                  <span className="delete-confirm-text">⚠️ Excluir <strong>{p.name}</strong>?</span>
                  <div className="delete-confirm-actions">
                    <button className="confirm-cancel-btn" onClick={() => setConfirmDeleteId(null)}>Não</button>
                    <button className="confirm-delete-btn" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={13} /> Sim, excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
