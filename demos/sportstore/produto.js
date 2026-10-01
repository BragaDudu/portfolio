// ========================================
// PÁGINA DE DETALHES DO PRODUTO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    updateCartCount();
});

function loadProductDetails() {
    const productId = localStorage.getItem('selectedProduct');
    
    if (!productId) {
        document.getElementById('product-details').innerHTML = `
            <div class="error-message">
                <h2>❌ Produto não encontrado</h2>
                <p>Por favor, selecione um produto na página inicial.</p>
                <a href="index.html" class="btn-buy btn-large">Voltar para Loja</a>
            </div>
        `;
        return;
    }
    
    const produto = produtos[productId];
    
    if (!produto) {
        document.getElementById('product-details').innerHTML = `
            <div class="error-message">
                <h2>❌ Produto não encontrado</h2>
                <a href="index.html" class="btn-buy btn-large">Voltar para Loja</a>
            </div>
        `;
        return;
    }
    
    // Calcular desconto
    const desconto = Math.round((1 - produto.preco / produto.precoAntigo) * 100);
    
    // Categoria formatada
    const categoriaFormatada = {
        'tenis': '👟 Tênis',
        'camisetas': '👕 Camisetas',
        'shorts': '🩳 Shorts',
        'acessorios': '⌚ Acessórios'
    };
    
    const detailsHTML = `
        <div class="details-grid">
            <!-- IMAGEM -->
            <div class="details-image">
                <img src="${produto.imagem}" alt="${produto.nome}">
            </div>
            
            <!-- INFORMAÇÕES -->
            <div class="details-info">
                <div class="breadcrumb">
                    <a href="index.html">Início</a> / 
                    <span>${categoriaFormatada[produto.categoria] || produto.categoria}</span> / 
                    <span>${produto.nome}</span>
                </div>
                
                <h1 class="details-title">${produto.nome}</h1>
                
                <div class="details-rating">
                    ⭐⭐⭐⭐⭐ <span>(${Math.floor(Math.random() * 200) + 50} avaliações)</span>
                </div>
                
                <p class="details-description">${produto.descricao}</p>
                
                <!-- PREÇOS -->
                <div class="details-price">
                    <span class="price-old">R$ ${produto.precoAntigo.toFixed(2)}</span>
                    <span class="price-current">R$ ${produto.preco.toFixed(2)}</span>
                    <span class="price-discount">
                        ${desconto}% OFF
                    </span>
                </div>
                
                <!-- ESTOQUE -->
                <div class="stock-info">
                    ${produto.estoque > 10 
                        ? `<span class="stock-available">✓ ${produto.estoque} unidades disponíveis</span>` 
                        : produto.estoque > 0 
                            ? `<span class="stock-low">⚠️ Últimas ${produto.estoque} unidades!</span>`
                            : `<span class="stock-out">❌ Produto esgotado</span>`
                    }
                </div>
                
                <!-- DETALHES -->
                <div class="details-features">
                    <h3>📋 Características:</h3>
                    <ul>
                        ${produto.detalhes.map(detalhe => `<li>✓ ${detalhe}</li>`).join('')}
                    </ul>
                </div>
                
                <!-- QUANTIDADE -->
                <div class="quantity-selector">
                    <label>Quantidade:</label>
                    <div class="quantity-controls">
                        <button onclick="decreaseQuantity()">−</button>
                        <input type="number" id="quantity" value="1" min="1" max="${produto.estoque}" readonly>
                        <button onclick="increaseQuantity()">+</button>
                    </div>
                </div>
                
                <!-- BOTÕES -->
                <div class="details-buttons">
                    <button class="btn-buy btn-large" onclick="addToCartFromDetails(${produto.id})" ${produto.estoque === 0 ? 'disabled' : ''}>
                        🛒 Adicionar ao Carrinho
                    </button>
                    <button class="btn-details btn-large" onclick="buyNow(${produto.id})" ${produto.estoque === 0 ? 'disabled' : ''}>
                        ⚡ Comprar Agora
                    </button>
                </div>
                
                <!-- INFORMAÇÕES EXTRAS -->
                <div class="details-extras">
                    <div class="extra-item">
                        <span class="extra-icon">🚚</span>
                        <div>
                            <strong>Frete Grátis</strong>
                            <p>Acima de R$ 199,00</p>
                        </div>
                    </div>
                    <div class="extra-item">
                        <span class="extra-icon">🔄</span>
                        <div>
                            <strong>Devolução Grátis</strong>
                            <p>Em até 30 dias</p>
                        </div>
                    </div>
                    <div class="extra-item">
                        <span class="extra-icon">✅</span>
                        <div>
                            <strong>Garantia</strong>
                            <p>12 meses</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('product-details').innerHTML = detailsHTML;
}

function increaseQuantity() {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    const maxValue = parseInt(input.max);
    
    if (currentValue < maxValue) {
        input.value = currentValue + 1;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    const currentValue = parseInt(input.value);
    
    if (currentValue > 1) {
        input.value = currentValue - 1;
    }
}

function addToCartFromDetails(productId) {
    const quantidade = parseInt(document.getElementById('quantity').value);
    const cart = getCart();
    const produto = produtos[productId];
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantidade += quantidade;
    } else {
        cart.push({
            id: productId,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: quantidade
        });
    }
    
    saveCart(cart);
    updateCartCount();
    showNotification(`✅ ${quantidade} item(ns) adicionado(s) ao carrinho!`);
}

function buyNow(productId) {
    addToCartFromDetails(productId);
    setTimeout(() => {
        window.location.href = 'carrinho.html';
    }, 500);
}