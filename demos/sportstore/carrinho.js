// ========================================
// PÁGINA DO CARRINHO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
});

function loadCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cart-items');
    const cartSummaryDiv = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <h2>🛒 Seu carrinho está vazio</h2>
                <p>Adicione produtos para começar suas compras!</p>
                <a href="index.html" class="btn-buy btn-large">Ver Produtos</a>
            </div>
        `;
        cartSummaryDiv.innerHTML = '';
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.preco * item.quantidade;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <img src="${item.imagem}" alt="${item.nome}">
                
                <div class="cart-item-info">
                    <h3>${item.nome}</h3>
                    <p class="cart-item-price">R$ ${item.preco.toFixed(2)} cada</p>
                </div>
                
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantidade}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                
                <div class="cart-item-total">
                    <p>R$ ${itemTotal.toFixed(2)}</p>
                </div>
                
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remover produto">
                    🗑️
                </button>
            </div>
        `;
    });
    
    cartItemsDiv.innerHTML = cartHTML;
    
    // Calcular totais
    const frete = subtotal >= 199 ? 0 : 15.90;
    const total = subtotal + frete;
    
    cartSummaryDiv.innerHTML = `
        <h3>📋 Resumo do Pedido</h3>
        
        <div class="summary-line">
            <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantidade, 0)} itens):</span>
            <span>R$ ${subtotal.toFixed(2)}</span>
        </div>
        
        <div class="summary-line">
            <span>Frete:</span>
            <span>${frete === 0 ? '<strong style="color: #10B981;">GRÁTIS</strong>' : 'R$ ' + frete.toFixed(2)}</span>
        </div>
        
        ${frete > 0 && subtotal < 199 ? `
            <div class="frete-alert">
                💡 Faltam apenas <strong>R$ ${(199 - subtotal).toFixed(2)}</strong> para frete grátis!
            </div>
        ` : frete === 0 ? `
            <div class="frete-alert" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-color: #10B981; color: #065f46;">
                ✅ Você ganhou frete grátis!
            </div>
        ` : ''}
        
        <div class="summary-line summary-total">
            <span>Total:</span>
            <span>R$ ${total.toFixed(2)}</span>
        </div>
        
        <button class="btn-buy btn-large" onclick="irParaCheckout()">
            ✓ Finalizar Compra
        </button>
        
        <button class="btn-details btn-large" onclick="limparCarrinho()">
            🗑️ Limpar Carrinho
        </button>
        
        <div class="payment-methods">
            <p>💳 Aceitamos:</p>
            <div class="payment-icons">
                <span>💳 Cartão de Crédito</span>
                <span>🏦 PIX</span>
                <span>📱 Boleto</span>
            </div>
        </div>
    `;
}

function updateQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantidade += change;
        
        if (item.quantidade <= 0) {
            removeFromCart(productId);
            return;
        }
        
        // Verificar estoque
        const produto = produtos[productId];
        if (produto && item.quantidade > produto.estoque) {
            showNotification(`⚠️ Apenas ${produto.estoque} unidades disponíveis!`);
            item.quantidade = produto.estoque;
        }
        
        saveCart(cart);
        loadCart();
        updateCartCount();
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    loadCart();
    updateCartCount();
    showNotification('🗑️ Produto removido do carrinho');
}

function limparCarrinho() {
    if (confirm('⚠️ Tem certeza que deseja limpar o carrinho?')) {
        localStorage.removeItem('cart');
        loadCart();
        updateCartCount();
        showNotification('🗑️ Carrinho limpo!');
    }
}

function irParaCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('❌ Seu carrinho está vazio!');
        return;
    }
    
    window.location.href = 'checkout.html';
}