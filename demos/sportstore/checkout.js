// ========================================
// PÁGINA DE CHECKOUT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutSummary();
    updateCartCount();
    setupPaymentOptions();
    setupFormValidation();
    setupCEPAutocomplete();
});

// Carregar resumo do pedido
function loadCheckoutSummary() {
    const cart = getCart();
    const summaryDiv = document.getElementById('checkout-summary');
    
    if (cart.length === 0) {
        window.location.href = 'carrinho.html';
        return;
    }
    
    let subtotal = 0;
    let itemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.preco * item.quantidade;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="summary-item">
                <img src="${item.imagem}" alt="${item.nome}">
                <div class="summary-item-info">
                    <p class="summary-item-name">${item.nome}</p>
                    <p class="summary-item-quantity">Qtd: ${item.quantidade}</p>
                </div>
                <p class="summary-item-price">R$ ${itemTotal.toFixed(2)}</p>
            </div>
        `;
    });
    
    const frete = subtotal >= 199 ? 0 : 15.90;
    const total = subtotal + frete;
    
    summaryDiv.innerHTML = `
        <h3>📦 Resumo do Pedido</h3>
        
        <div class="summary-items">
            ${itemsHTML}
        </div>
        
        <div class="summary-totals">
            <div class="summary-line">
                <span>Subtotal:</span>
                <span>R$ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Frete:</span>
                <span>${frete === 0 ? '<strong style="color: #10B981;">GRÁTIS</strong>' : 'R$ ' + frete.toFixed(2)}</span>
            </div>
            <div class="summary-line summary-total">
                <span>Total:</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="security-badge">
            <p>🔒 Compra 100% Segura</p>
            <p style="font-size: 12px; opacity: 0.8;">Seus dados estão protegidos</p>
        </div>
    `;
}

// Configurar opções de pagamento
function setupPaymentOptions() {
    const paymentRadios = document.querySelectorAll('input[name="pagamento"]');
    const cartaoForm = document.getElementById('cartao-form');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'credito') {
                cartaoForm.style.display = 'block';
                // Tornar campos obrigatórios
                document.getElementById('numero-cartao').required = true;
                document.getElementById('nome-cartao').required = true;
                document.getElementById('validade').required = true;
                document.getElementById('cvv').required = true;
            } else {
                cartaoForm.style.display = 'none';
                // Remover obrigatoriedade
                document.getElementById('numero-cartao').required = false;
                document.getElementById('nome-cartao').required = false;
                document.getElementById('validade').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    });
}

// Configurar validação do formulário
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            e.target.value = value;
        }
    });
    
    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
            e.target.value = value;
        }
    });
    
    // Máscara para número do cartão
    const numeroCartaoInput = document.getElementById('numero-cartao');
    numeroCartaoInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 16) {
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        }
    });
    
    // Máscara para validade
    const validadeInput = document.getElementById('validade');
    validadeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            value = value.replace(/^(\d{2})(\d{2}).*/, '$1/$2');
            e.target.value = value;
        }
    });
    
    // Máscara para CVV
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });
    
    // Submit do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        processarPedido();
    });
}

// Autocompletar CEP (simulado)
function setupCEPAutocomplete() {
    const cepInput = document.getElementById('cep');
    
    cepInput.addEventListener('blur', function() {
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            // Em produção, aqui você faria uma chamada para API ViaCEP
            // Simulando preenchimento automático
            showNotification('🔍 Buscando endereço...');
            
            setTimeout(() => {
                // Dados simulados
                document.getElementById('rua').value = 'Rua Exemplo';
                document.getElementById('bairro').value = 'Centro';
                document.getElementById('cidade').value = 'São Paulo';
                document.getElementById('estado').value = 'SP';
                showNotification('✅ Endereço encontrado!');
            }, 1000);
        }
    });
}

// Processar pedido
function processarPedido() {
    const formaPagamento = document.querySelector('input[name="pagamento"]:checked').value;
    const cart = getCart();
    
    // Calcular total
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const frete = subtotal >= 199 ? 0 : 15.90;
    const total = subtotal + frete;
    
    // Coletar dados do formulário
    const pedido = {
        numero: Math.floor(Math.random() * 1000000),
        data: new Date().toISOString(),
        cliente: {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value
        },
        endereco: {
            cep: document.getElementById('cep').value,
            rua: document.getElementById('rua').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value
        },
        pagamento: {
            forma: formaPagamento,
            parcelas: formaPagamento === 'credito' ? document.getElementById('parcelas').value : 1
        },
        itens: cart,
        valores: {
            subtotal: subtotal,
            frete: frete,
            total: total
        }
    };
    
    // Salvar pedido
    localStorage.setItem('ultimoPedido', JSON.stringify(pedido));
    
    // Limpar carrinho
    localStorage.removeItem('cart');
    
    // Mostrar loading
    const btn = document.querySelector('.btn-checkout');
    btn.textContent = '⏳ Processando pagamento...';
    btn.disabled = true;
    
    // Simular processamento
    setTimeout(() => {
        window.location.href = 'confirmacao.html';
    }, 2000);
}