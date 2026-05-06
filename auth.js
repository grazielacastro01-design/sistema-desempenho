// Função para verificar se o usuário é Administrador
function verificarAutenticacao() {
    // 1. Pega os dados do usuário salvos no navegador pelo login
    const usuarioLogado = localStorage.getItem('usuario') 
        ? JSON.parse(localStorage.getItem('usuario')) 
        : null;

    // 2. Regra de segurança: Se não estiver logado OU o perfil não for Admin...
    if (!usuarioLogado || usuarioLogado.perfil !== 'Admin') {
        // Exibe o alerta de bloqueio
        alert("Acesso negado! Apenas usuários administradores podem acessar esta página.");
        
        // Manda de volta para a tela inicial / painel principal
        window.location.href = 'dashboard.html'; 
    }
}

// Executa a função automaticamente assim que a página terminar de carregar
window.addEventListener('DOMContentLoaded', verificarAutenticacao);