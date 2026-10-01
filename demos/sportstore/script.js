// ========================================
// BANCO DE DADOS DOS PRODUTOS (20 PRODUTOS)
// ========================================
const produtos = {
    // ========== TÊNIS ==========
    1: {
        id: 1,
        nome: "Tênis Running Pro",
        preco: 199.00,
        precoAntigo: 299.00,
        categoria: "tenis",
        imagem: "imagens/tenis/tenis-corrida-01.webp",  // ✅ .webp
        descricao: "Tênis ideal para corrida de longa distância com tecnologia de amortecimento avançado.",
        detalhes: [
            "Material respirável de alta qualidade",
            "Solado antiderrapante com aderência superior",
            "Amortecimento em gel na entressola",
            "Peso ultra-leve: apenas 280g",
            "Disponível em várias cores e tamanhos"
        ],
        estoque: 15
    },
    2: {
        id: 2,
        nome: "Tênis Speed Max",
        preco: 249.00,
        precoAntigo: 349.00,
        categoria: "tenis",
        imagem: "imagens/tenis/tenis-corrida-02.jpeg",  // ✅ .jpeg
        descricao: "Leveza e velocidade para treinos intensos e competições de alto nível.",
        detalhes: [
            "Design aerodinâmico para máxima velocidade",
            "Ultra leve com apenas 230g",
            "Tecnologia de resposta rápida na pisada",
            "Cabedal em mesh respirável",
            "Ideal para velocistas e sprinters"
        ],
        estoque: 12
    },
    3: {
        id: 3,
        nome: "Tênis Ultra Comfort",
        preco: 189.00,
        precoAntigo: 279.00,
        categoria: "tenis",
        imagem: "imagens/tenis/tenis-corrida-03.jpeg",  // ✅ .jpeg
        descricao: "Máximo conforto para o dia a dia e caminhadas longas.",
        detalhes: [
            "Palmilha memory foam com tecnologia anti-impacto",
            "Máximo conforto para uso prolongado",
            "Design casual e versátil",
            "Peso confortável: 310g",
            "Perfeito para uso diário"
        ],
        estoque: 20
    },
    4: {
        id: 4,
        nome: "Tênis Trail Runner",
        preco: 299.00,
        precoAntigo: 399.00,
        categoria: "tenis",
        imagem: "imagens/tenis/tenis-corrida-04.jpeg",  // ✅ .jpeg
        descricao: "Perfeito para trilhas e terrenos irregulares com grip superior.",
        detalhes: [
            "Solado com travas profundas para terrenos difíceis",
            "Resistente à água e lama",
            "Proteção reforçada no calcanhar e dedos",
            "Peso robusto: 350g",
            "Desenvolvido para trail running"
        ],
        estoque: 8
    },
    5: {
        id: 5,
        nome: "Tênis Elite Racing",
        preco: 379.00,
        precoAntigo: 499.00,
        categoria: "tenis",
        imagem: "imagens/tenis/tenis-corrida-05.webp",  // ✅ .webp
        descricao: "Para atletas que buscam performance máxima em competições.",
        detalhes: [
            "Tecnologia de elite usada por profissionais",
            "Máxima resposta e retorno de energia",
            "Placa de carbono integrada na sola",
            "Peso ultra competitivo: apenas 200g",
            "Usado por atletas olímpicos"
        ],
        estoque: 5
    },

    // ========== CAMISETAS ==========
    6: {
        id: 6,
        nome: "Camiseta Dry Fit",
        preco: 79.00,
        precoAntigo: 129.00,
        categoria: "camisetas",
        imagem: "imagens/camisetas/camiseta-corrida-01.jpeg",
        descricao: "Tecnologia que mantém você seco durante o treino mais intenso.",
        detalhes: [
            "Tecido Dry-Fit com tecnologia de secagem rápida",
            "Evaporação rápida do suor",
            "Tratamento antibacteriano",
            "100% Poliéster de alta performance",
            "Proteção UV 50+"
        ],
        estoque: 30
    },
    7: {
        id: 7,
        nome: "Camiseta Running Pro",
        preco: 89.00,
        precoAntigo: 149.00,
        categoria: "camisetas",
        imagem: "imagens/camisetas/camiseta-corrida-02.jpeg",
        descricao: "Leve e respirável para máxima performance em qualquer treino.",
        detalhes: [
            "Ultra respirável com ventilação estratégica",
            "Costuras flat lock anti-irritação",
            "Peso pena: apenas 120g",
            "Zonas em mesh para maior ventilação",
            "Performance profissional"
        ],
        estoque: 25
    },
    8: {
        id: 8,
        nome: "Camiseta Sport Comfort",
        preco: 69.00,
        precoAntigo: 119.00,
        categoria: "camisetas",
        imagem: "imagens/camisetas/camiseta-corrida-03.jpeg",
        descricao: "Conforto absoluto para treinos longos e uso casual.",
        detalhes: [
            "Blend de algodão e poliéster premium",
            "Conforto máximo para uso prolongado",
            "Modelagem ampla e confortável",
            "Uso versátil: treino e casual",
            "Disponível em várias cores"
        ],
        estoque: 40
    },
    9: {
        id: 9,
        nome: "Camiseta Tech Performance",
        preco: 99.00,
        precoAntigo: 159.00,
        categoria: "camisetas",
        imagem: "imagens/camisetas/camiseta-corrida-04.jpeg",
        descricao: "Tecnologia avançada para atletas exigentes que buscam o melhor.",
        detalhes: [
            "Tecnologia cooling para regulação térmica",
            "Sistema de controle de odor integrado",
            "Ajuste ergonômico ao corpo",
            "Alta durabilidade mesmo após muitas lavagens",
            "Design premium e sofisticado"
        ],
        estoque: 18
    },
    10: {
        id: 10,
        nome: "Camiseta Elite Runner",
        preco: 119.00,
        precoAntigo: 179.00,
        categoria: "camisetas",
        imagem: "imagens/camisetas/camiseta-corrida-05.jpeg",
        descricao: "Edição especial para corredores profissionais e competições.",
        detalhes: [
            "Edição limitada desenvolvida com atletas",
            "Tecido italiano de alta performance",
            "Design aerodinâmico testado em túnel de vento",
            "Aprovada e usada por profissionais",
            "Certificação oficial de competição"
        ],
        estoque: 10
    },

    // ========== SHORTS ==========
    11: {
        id: 11,
        nome: "Shorts Performance Pro",
        preco: 79.00,
        precoAntigo: 129.00,
        categoria: "shorts",
        imagem: "imagens/shorts/shorts-corrida-01.jpeg",  // ✅ CORRIGIDO
        descricao: "Liberdade de movimento total para seus treinos mais intensos.",
        detalhes: [
            "Tecido elástico 4-way stretch",
            "Cintura ajustável com cordão interno",
            "Bolsos laterais com zíper",
            "Secagem ultra rápida",
            "Comprimento ideal para corrida"
        ],
        estoque: 22
    },
    12: {
        id: 12,
        nome: "Shorts Running Light",
        preco: 89.00,
        precoAntigo: 139.00,
        categoria: "shorts",
        imagem: "imagens/shorts/shorts-corrida-02.jpeg",  // ✅ CORRIGIDO
        descricao: "Ultra leve e respirável para corridas de longa distância.",
        detalhes: [
            "Peso pena: apenas 90g",
            "Mesh lateral para ventilação máxima",
            "Sunga interna integrada",
            "Forro anti-fricção",
            "Ideal para maratonas"
        ],
        estoque: 18
    },
    13: {
        id: 13,
        nome: "Shorts Training Comfort",
        preco: 59.00,
        precoAntigo: 99.00,
        categoria: "shorts",
        imagem: "imagens/shorts/shorts-corrida-03.jpeg",  // ✅ CORRIGIDO
        descricao: "Conforto máximo para treinos de academia e atividades variadas.",
        detalhes: [
            "Tecido macio e confortável",
            "Modelagem ampla para liberdade total",
            "Elástico largo na cintura",
            "Bolsos profundos",
            "Uso versátil: academia, corrida, casual"
        ],
        estoque: 35
    },
    14: {
        id: 14,
        nome: "Shorts Sport Flex",
        preco: 99.00,
        precoAntigo: 149.00,
        categoria: "shorts",
        imagem: "imagens/shorts/shorts-corrida-04.jpeg",  // ✅ CORRIGIDO
        descricao: "Elasticidade e durabilidade para os treinos mais exigentes.",
        detalhes: [
            "Tecido flexível de alta resistência",
            "Costura reforçada nos pontos críticos",
            "Tecnologia anti-odor",
            "Design ergonômico",
            "Alta durabilidade"
        ],
        estoque: 15
    },
    15: {
        id: 15,
        nome: "Shorts Elite Competition",
        preco: 119.00,
        precoAntigo: 189.00,
        categoria: "shorts",
        imagem: "imagens/shorts/shorts-corrida-05.jpeg",  // ✅ CORRIGIDO
        descricao: "Desenvolvido para atletas de alta performance em competições.",
        detalhes: [
            "Design aerodinâmico profissional",
            "Compressão leve para suporte muscular",
            "Faixas refletivas para segurança",
            "Aprovado para competições oficiais",
            "Usado por atletas de elite"
        ],
        estoque: 8
    },

    // ========== ACESSÓRIOS ==========
    16: {
        id: 16,
        nome: "Relógio GPS Running",
        preco: 399.00,
        precoAntigo: 799.00,
        categoria: "acessorios",
        imagem: "imagens/acessorios/acessorios-corrida-01.jpeg",  // ✅ CORRIGIDO
        descricao: "Monitore distância, ritmo e frequência cardíaca em tempo real.",
        detalhes: [
            "GPS integrado de alta precisão",
            "Monitor de frequência cardíaca no pulso",
            "Bateria com duração de 7 dias",
            "Resistente à água (5 ATM)",
            "Sincronização com smartphone"
        ],
        estoque: 12
    },
    17: {
        id: 17,
        nome: "Garrafa Térmica Sport",
        preco: 39.00,
        precoAntigo: 69.00,
        categoria: "acessorios",
        imagem: "imagens/acessorios/acessorios-corrida-02.jpeg",  // ✅ CORRIGIDO
        descricao: "Mantém suas bebidas geladas por até 24 horas durante o treino.",
        detalhes: [
            "Isolamento térmico a vácuo duplo",
            "Capacidade de 750ml",
            "Tampa com vedação hermética",
            "Livre de BPA",
            "Mantém temperatura por 24h"
        ],
        estoque: 50
    },
    18: {
        id: 18,
        nome: "Mochila Hidratação",
        preco: 99.00,
        precoAntigo: 179.00,
        categoria: "acessorios",
        imagem: "imagens/acessorios/acessorios-corrida-03.jpeg",  // ✅ CORRIGIDO
        descricao: "Ideal para trilhas longas com sistema de hidratação integrado.",
        detalhes: [
            "Reservatório de 2 litros incluído",
            "Alças acolchoadas ajustáveis",
            "Compartimentos múltiplos",
            "Tecido resistente à água",
            "Peso leve: apenas 400g"
        ],
        estoque: 15
    },
    19: {
        id: 19,
        nome: "Fone Bluetooth Sport",
        preco: 149.00,
        precoAntigo: 249.00,
        categoria: "acessorios",
        imagem: "imagens/acessorios/acessorios-corrida-04.jpeg",  // ✅ CORRIGIDO
        descricao: "À prova d'água com cancelamento de ruído para foco total.",
        detalhes: [
            "Certificação IPX7 (totalmente à prova d'água)",
            "Cancelamento ativo de ruído",
            "Bateria com 8 horas de duração",
            "Ajuste seguro para esportes",
            "Som de alta qualidade"
        ],
        estoque: 20
    },
    20: {
        id: 20,
        nome: "Kit Acessórios Runner",
        preco: 79.00,
        precoAntigo: 129.00,
        categoria: "acessorios",
        imagem: "imagens/acessorios/acessorios-corrida-05.jpeg",  // ✅ CORRIGIDO
        descricao: "Conjunto completo: braçadeira, viseira, meias e toalha esportiva.",
        detalhes: [
            "Braçadeira para smartphone ajustável",
            "Viseira com proteção UV",
            "Par de meias de compressão",
            "Toalha esportiva de microfibra",
            "Kit completo para corredores"
        ],
        estoque: 25
    }
};

// ========================================
// FUNÇÕES DO CARRINHO
// ========================================

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    setupCategoryFilter();
});

// Pegar carrinho do localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Salvar carrinho no localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Adicionar produto ao carrinho
function addToCart(productId) {
    const cart = getCart();
    const produto = produtos[productId];
    
    if (!produto) {
        showNotification('❌ Produto não encontrado!');
        return;
    }
    
    // Verificar se já existe no carrinho
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantidade++;
    } else {
        cart.push({
            id: productId,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: 1
        });
    }
    
    saveCart(cart);
    updateCartCount();
    
    // Animação do botão
    const button = event.target;
    button.classList.add('adding');
    button.textContent = '✓ Adicionado!';
    
    setTimeout(() => {
        button.classList.remove('adding');
        button.innerHTML = '🛒 Adicionar';
    }, 1000);
    
    // Mostrar notificação
    showNotification(`✅ ${produto.nome} adicionado ao carrinho!`);
}

// Atualizar contador do carrinho
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantidade, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Ver detalhes do produto
function viewDetails(productId) {
    localStorage.setItem('selectedProduct', productId);
    window.location.href = 'produto.html';
}

// ========================================
// FILTRO POR CATEGORIA
// ========================================
function setupCategoryFilter() {
    const categoryLinks = document.querySelectorAll('[data-category]');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
            
            // Scroll suave para produtos
            document.querySelector('.products-grid').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    });
}

function filterByCategory(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        
        if (category === 'todos') {
            product.style.display = 'flex';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, 10);
        } else {
            if (productCategory === category) {
                product.style.display = 'flex';
                setTimeout(() => {
                    product.style.opacity = '1';
                    product.style.transform = 'translateY(0)';
                }, 10);
            } else {
                product.style.opacity = '0';
                product.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    product.style.display = 'none';
                }, 300);
            }
        }
    });
}

// ========================================
// NOTIFICAÇÕES
// ========================================
function showNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ========================================
// SCROLL SUAVE PARA PRODUTOS
// ========================================
function scrollToProducts() {
    document.querySelector('.products-grid').scrollIntoView({ 
        behavior: 'smooth' 
    });
}