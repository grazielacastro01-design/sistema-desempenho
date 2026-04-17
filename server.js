<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Perfil do Colaborador | Sistema de Desempenho</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
        .tab-active { border-bottom: 3px solid #2563eb; color: #2563eb; }
        .hidden { display: none; }
        .glass-modal { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); }
    </style>
</head>
<body class="antialiased">

    <div id="modalFeedback" class="fixed inset-0 z-[100] flex items-center justify-center hidden p-6 glass-modal">
        <div class="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl scale-95 transition-all">
            <h3 class="text-2xl font-black text-slate-900 mb-2">Registrar Feedback</h3>
            <p class="text-slate-500 text-sm mb-8">O registro será salvo na sua tabela de avaliações no Railway.</p>
            
            <form id="formFeedback">
                <div class="mb-6">
                    <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Tipo de Feedback</label>
                    <select id="tipoFeedback" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-blue-500">
                        <option value="1">🟢 Positivo</option>
                        <option value="2">🟡 Melhoria</option>
                        <option value="3">🔴 Crítico</option>
                    </select>
                </div>
                
                <div class="mb-8">
                    <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Sua Mensagem</label>
                    <textarea id="textoFeedback" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500" placeholder="Descreva os pontos observados..." required></textarea>
                </div>

                <div class="flex gap-4">
                    <button type="button" onclick="fecharModal()" class="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition">Cancelar</button>
                    <button type="submit" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition">Salvar no Banco</button>
                </div>
            </form>
        </div>
    </div>

    <header class="bg-[#0f172a] w-full h-20 flex items-center px-6 justify-between text-white shadow-2xl">
        <div class="flex items-center gap-3">
            <div class="bg-blue-600 p-2 rounded-xl">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13.125C3 12.5037 3.50371 12 4.125 12H6.375C6.99629 12 7.5 12.5037 7.5 13.125V20.25H3V13.125ZM10.5 7.875C10.5 7.25371 11.0037 6.75 11.625 6.75H13.875C14.4963 6.75 15 7.25371 15 7.875V20.25H10.5V7.875ZM18 4.125C18 3.50371 18.5037 3 19.125 3H21.375C21.9963 3 22.5 3.50371 22.5 4.125V20.25H18V4.125Z"/></svg>
            </div>
            <span class="text-xl font-bold uppercase tracking-tight">Portal do Colaborador</span>
        </div>
        <a href="colaboradores.html" class="text-slate-300 font-bold text-sm hover:text-white transition">Voltar à Lista</a>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-12">
        <div class="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 mb-8 flex items-center gap-8">
            <div id="avatarIniciais" class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black">--</div>
            <div class="flex-1">
                <h1 id="nomeColaborador" class="text-3xl font-extrabold text-slate-900 italic tracking-tight text-blue-600 uppercase">Carregando...</h1>
                <p id="cargoColaborador" class="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Buscando cargo...</p>
            </div>
        </div>

        <div class="flex gap-8 border-b border-slate-200 mb-8 px-4">
            <button onclick="switchTab('metas')" id="btn-metas" class="pb-4 font-bold text-sm tab-active transition-all">Metas OKR</button>
            <button onclick="switchTab('feedbacks')" id="btn-feedbacks" class="pb-4 font-bold text-sm text-slate-400">Feedbacks</button>
            <button onclick="switchTab('pdi')" id="btn-pdi" class="pb-4 font-bold text-sm text-slate-400">Avaliação & PDI</button>
        </div>

        <div id="secao-metas" class="space-y-6">
            <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
                <div class="flex-1">
                    <h3 class="font-bold text-slate-800 text-lg">Progresso Geral do Ciclo</h3>
                    <div class="w-full bg-slate-100 h-2 rounded-full mt-4 max-w-md overflow-hidden">
                        <div class="bg-blue-600 h-full w-[85%]"></div>
                    </div>
                </div>
                <span class="text-blue-600 font-black text-2xl">85%</span>
            </div>
        </div>

        <div id="secao-feedbacks" class="hidden space-y-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-black text-slate-800">Histórico de Avaliações</h2>
                <button onclick="abrirModal()" class="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-lg hover:bg-blue-600 transition">+ Registrar Novo</button>
            </div>
            <div id="listaFeedbacks" class="space-y-4">
                <p class="text-slate-400 italic text-sm">Carregando histórico...</p>
            </div>
        </div>

        <div id="secao-pdi" class="hidden space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 class="font-bold text-slate-800 mb-4">Minha Autoavaliação</h3>
                    <button onclick="location.href='avaliar.html'" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Acessar Formulário</button>
                </div>
            </div>
        </div>
    </main>

    <script>
        // CONFIGURAÇÃO DA API NO RAILWAY
        const API_URL = 'https://sistema-desempenho-production.up.railway.app';
        const ID_USUARIO_LOGADO = 1;

        window.onload = function() {
            carregarDadosColaborador();
            carregarHistoricoAvaliacoes();
        };

        function carregarDadosColaborador() {
            fetch(`${API_URL}/colaborador/${ID_USUARIO_LOGADO}`)
                .then(res => res.json())
                .then(pessoa => {
                    document.getElementById('nomeColaborador').innerText = pessoa.nome || 'Nome Não Encontrado';
                    document.getElementById('cargoColaborador').innerText = 'Colaborador | ID: ' + pessoa.pessoa_id;
                    document.getElementById('avatarIniciais').innerText = (pessoa.nome || "GC").substring(0,2).toUpperCase();
                })
                .catch(err => {
                    console.error("Erro ao carregar perfil:", err);
                    document.getElementById('nomeColaborador').innerText = "Erro na Conexão";
                });
        }

        function carregarHistoricoAvaliacoes() {
            fetch(`${API_URL}/feedbacks/${ID_USUARIO_LOGADO}`)
                .then(res => res.json())
                .then(avaliacoes => {
                    const container = document.getElementById('listaFeedbacks');
                    container.innerHTML = avaliacoes.length > 0 ? '' : '<p class="text-slate-400 italic text-sm">Nenhum registro encontrado no banco.</p>';
                    
                    avaliacoes.forEach(av => {
                        container.innerHTML += `
                            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div class="flex justify-between mb-2 text-[10px] font-black uppercase text-blue-500">
                                    <span>ID: ${av.idAvaliacacao}</span>
                                </div>
                                <p class="text-sm text-slate-700">"${av.comentario}"</p>
                            </div>
                        `;
                    });
                })
                .catch(err => console.error("Erro ao carregar feedbacks:", err));
        }

        document.getElementById('formFeedback').onsubmit = function(e) {
            e.preventDefault();
            const dados = {
                nota: 5,
                comentario: document.getElementById('textoFeedback').value,
                idPessoa: ID_USUARIO_LOGADO,
                idStatus: document.getElementById('tipoFeedback').value
            };

            fetch(`${API_URL}/registrar-avaliacao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })
            .then(res => res.json())
                .then(() => {
                alert('Salvo com sucesso no MySQL do Railway!');
                fecharModal();
                carregarHistoricoAvaliacoes();
                document.getElementById('formFeedback').reset();
            })
            .catch(err => alert('Erro ao salvar. Verifique se o servidor no Railway está ativo.'));
        };

        function abrirModal() { document.getElementById('modalFeedback').classList.remove('hidden'); }
        function fecharModal() { document.getElementById('modalFeedback').classList.add('hidden'); }
        
        function switchTab(tabName) {
            ['metas', 'feedbacks', 'pdi'].forEach(t => {
                document.getElementById('secao-' + t).classList.add('hidden');
                document.getElementById('btn-' + t).classList.remove('tab-active');
                document.getElementById('btn-' + t).classList.add('text-slate-400');
            });
            document.getElementById('secao-' + tabName).classList.remove('hidden');
            document.getElementById('btn-' + tabName).classList.add('tab-active');
            document.getElementById('btn-' + tabName).classList.remove('text-slate-400');
        }
    </script>
</body>
</html>