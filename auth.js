function verificarAutenticacao() {
    // 1. Pega os dados do usuário que o seu sistema salvou no localStorage
    const usuarioLogado = localStorage.getItem('usuario') 
        ? JSON.parse(localStorage.getItem('usuario')) 
        : null;

    // 2. Se não tiver ninguém logado OU o perfil for diferente de 'Admin' (ex: 'Gestor')
    if (!usuarioLogado || usuarioLogado.perfil !== 'Admin') {
        
        // Avisa que ele não tem permissão
        alert("Acesso negado! Apenas usuários Administradores podem gerenciar usuários.");
        
        // Chuta ele de volta para a tela inicial (Dashboard)
        window.location.href = 'dashboard.html';
    }
}

// Executa a verificação assim que a página termina de carregar o HTML
window.addEventListener('DOMContentLoaded', verificarAutenticacao);