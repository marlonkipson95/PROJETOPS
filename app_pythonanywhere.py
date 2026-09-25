import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai

# --- 1. Inicialização da Aplicação Flask ---
app = Flask(__name__)
# Habilita CORS completo para o Firebase Hosting e ambiente local
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- 2. Inicialização do Firebase Admin SDK ---
CRED_PATH = "/home/marlonkipson/serviceAccountKey.json"

if not firebase_admin._apps:
    if os.path.exists(CRED_PATH):
        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

db = firestore.client()

# --- 3. Configuração do Google Gemini ---
API_KEY = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=API_KEY)

# Modelo atualizado: gemini-3.8-flash (com fallback para gemini-flash-latest)
try:
    modelo = genai.GenerativeModel('gemini-3.8-flash')
except Exception:
    modelo = genai.GenerativeModel('gemini-flash-latest')

# --- 4. Rotas da API ---

@app.route('/api/chat', methods=['POST'])
def chat_inteligente():
    try:
        dados = request.get_json()
        if not dados:
            return jsonify({"erro": "Nenhum dado fornecido"}), 400
            
        mensagem_usuario = dados.get('mensagem', '').strip()
        uid = dados.get('uid', '')
        
        if not mensagem_usuario:
            return jsonify({"erro": "Mensagem vazia"}), 400

        # Contexto do Usuário
        contexto_usuario = "Usuário Visitante"
        if uid:
            user_doc = db.collection('usuarios').document(uid).get()
            if user_doc.exists():
                u_data = user_doc.to_dict()
                contexto_usuario = f"Nome: {u_data.get('nome')}, Tipo de Conta: {u_data.get('tipo', 'solicitante')}, Cidade: {u_data.get('cidade', 'Não informada')}"

        # --- RAG ESTRUTURADO 1: Catálogo de Serviços Ativos ---
        servicos_docs = db.collection('servicos_avulsos').where('ativo', '==', True).limit(40).stream()
        lista_servicos = []
        for doc in servicos_docs:
            s_data = doc.to_dict()
            valor = s_data.get('valor_base') or s_data.get('valor') or 0
            valor_fmt = f"R$ {float(valor):.2f}" if valor else "Sob consulta"
            lista_servicos.append(
                f"- Título: {s_data.get('titulo')} | Categoria: {s_data.get('categoria')} › {s_data.get('subcategoria')} | Preço Base: {valor_fmt} | Descrição: {s_data.get('descricao', '')[:100]}"
            )
        texto_servicos = "\n".join(lista_servicos) if lista_servicos else "Nenhum serviço avulso ativo no momento."

        # --- RAG ESTRUTURADO 2: Top Prestadores e Ranking de Reputação ---
        prestadores_docs = db.collection('usuarios').where('tipo', 'in', ['prestador', 'ambos']).limit(20).stream()
        lista_prestadores = []
        for doc in prestadores_docs:
            p_data = doc.to_dict()
            nota = p_data.get('notaMedia') or 5.0
            pontos = p_data.get('pontos') or 0
            cidade = p_data.get('cidade') or 'Brasil'
            lista_prestadores.append(
                f"- Prestador: {p_data.get('nome')} | Cidade: {cidade} | Nota: {float(nota):.1f}⭐ | Pontos: {pontos} pts | Bio: {p_data.get('bio', 'Disponível na plataforma')[:80]}"
            )
        texto_prestadores = "\n".join(lista_prestadores) if lista_prestadores else "Nenhum prestador encontrado."

        # --- RAG ESTRUTURADO 3: Solicitações Abertas Aguardando Orçamento ---
        solics_docs = db.collection('solicitacoes').where('status', '==', 'ABERTA').limit(15).stream()
        lista_solics = []
        for doc in solics_docs:
            sol_data = doc.to_dict()
            lista_solics.append(
                f"- Solicitação: {sol_data.get('titulo')} | Categoria: {sol_data.get('categoria')} | Região: {sol_data.get('endereco', 'Não especificado')}"
            )
        texto_solics = "\n".join(lista_solics) if lista_solics else "Nenhuma solicitação aberta no momento."

        # --- RAG NÃO ESTRUTURADO: Base de Conhecimento e Regras de Negócio Oficiais ---
        rag_nao_estruturado = """
REGULAMENTO E DIRETRIZES DA PLATAFORMA SERVIÇOSAPP:
1. PERFIS E PERMISSÕES:
   - Solicitante (Pessoa Física ou Jurídica): utiliza a plataforma para cadastrar demandas, comparar orçamentos concorrentes e contratar serviços. Não é prestador de serviços e não pode emitir propostas para outros usuários.
   - Prestador de Serviços (Autônomo, MEI ou Empresa): cadastra serviços avulsos no catálogo, consulta solicitações abertas e envia propostas comerciais formais.
   - Ambos (Dual): possui acesso simultâneo às funcionalidades de contratante e prestador.
2. SIGILO E PRIVACIDADE DE ORÇAMENTOS:
   - Os prestadores concorrentes NUNCA têm visibilidade sobre os orçamentos, valores ou propostas dos concorrentes na mesma solicitação. O sigilo comercial é absoluto.
   - Apenas o solicitante proprietário da demanda tem acesso ao painel comparativo de propostas.
3. PRIVACIDADE DA CHAVE PIX:
   - Chaves Pix e dados sensíveis de pagamento NUNCA são expostos em catálogos abertos ou perfis públicos.
   - O demonstrativo de pagamento Pix e QR Code são liberados exclusivamente após o solicitante aprovar formalmente o orçamento.
4. FORMAÇÃO DO ORÇAMENTO:
   - O orçamento comercial discrimina com clareza: Mão de Obra, Insumos/Peças (com quantitativos e valores unitários), Taxa de Deslocamento/Logística, Prazo em dias úteis e Garantia Técnica (mínimo legal de 90 dias conforme CDC).
5. RANKING DE REPUTAÇÃO ORGÂNICO:
   - Fórmula: Pontos = (Concluídos × 25) + (Aprovados × 15) + (Nota Média × 20) + (Avaliações × 10).
"""

        # --- CONSTRUÇÃO DO PROMPT RIGOROSO (Anti-Alucinação com RAG Estruturado + Não-Estruturado) ---
        prompt_sistema = f"""
Você é o assistente inteligente oficial da plataforma de serviços "ServiçosApp".
Sua função é auxiliar contratantes e prestadores fornecendo informações estritamente baseadas nas bases RAG estruturadas e documentais abaixo.

CONTEXTO DO USUÁRIO QUE PERGUNTOU:
{contexto_usuario}

CONHECIMENTO DOCUMENTAL E REGRAS DE NEGÓCIO (RAG NÃO ESTRUTURADO):
{rag_nao_estruturado}

BASE DE DADOS DE SERVIÇOS AVULSOS (RAG ESTRUTURADO 1):
{texto_servicos}

BASE DE DADOS DE PRESTADORES E RANKING (RAG ESTRUTURADO 2):
{texto_prestadores}

MURAL DE SOLICITAÇÕES ABERTAS (RAG ESTRUTURADO 3):
{texto_solics}

PERGUNTA DO USUÁRIO:
{mensagem_usuario}

DIRETRIZES FUNDAMENTAIS (LEIA E SIGA RIGOROSAMENTE):
1. NUNCA invente serviços, nomes de prestadores, contatos, notas, chaves Pix ou valores que não estejam nas bases de dados acima.
2. Se o usuário perguntar sobre regras (como funciona Pix, sigilo de orçamentos, perfis, ranking ou garantias), responda com base no RAG Não Estruturado.
3. Se o usuário estiver procurando um serviço que exista na base, informe o título, categoria, valor base e recomende conferir no "Catálogo de Serviços" para contratar.
4. Se o serviço NÃO existir nas bases de dados, NÃO INVENTE. Responda: "No momento não temos esse serviço cadastrado no catálogo avulso. Você pode clicar em 'Nova Solicitação' para que nossos prestadores cadastrados enviem orçamentos diretamente para você!"
5. Seja prestativo, claro, ético e use Markdown amigável (tabelas, listas ou negrito onde for útil).
"""

        # --- CHAMADA AO GEMINI ---
        resposta = modelo.generate_content(prompt_sistema)
        texto_resposta = resposta.text if hasattr(resposta, 'text') else "Desculpe, não consegui processar a resposta no momento."
        
        return jsonify({
            "resposta": texto_resposta
        }), 200

    except Exception as e:
        err_msg = str(e)
        print(f"Erro na API de chat: {err_msg}")
        if "429" in err_msg or "quota" in err_msg.lower() or "ResourceExhausted" in err_msg:
            return jsonify({
                "resposta": "⏳ **Aviso de Quota:** O limite temporário da API gratuita do Gemini (5 requisições/min) foi atingido. Aguarde cerca de 30 segundos e tente perguntar novamente!"
            }), 200
        return jsonify({"erro": err_msg}), 500

# --- 5. Rota de Ferramentas MCP (Model Context Protocol) ---
@app.route('/api/mcp/tools', methods=['GET'])
def listar_ferramentas_mcp():
    """Declaração formal do catálogo de ferramentas compatível com o protocolo MCP"""
    return jsonify({
        "protocol": "mcp/1.0",
        "tools": [
            {
                "name": "consultar_catalogo_servicos",
                "description": "Recupera serviços avulsos cadastrados no catálogo com filtros por categoria ou termo de busca.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "categoria": {"type": "string", "description": "Categoria do serviço"},
                        "busca": {"type": "string", "description": "Termo de busca textual"}
                    }
                }
            },
            {
                "name": "consultar_ranking_prestadores",
                "description": "Recupera os melhores prestadores ordenados por pontuação de reputação e nota média.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "limite": {"type": "integer", "description": "Número máximo de prestadores a retornar"}
                    }
                }
            },
            {
                "name": "consultar_solicitacoes_abertas",
                "description": "Recupera demandas abertas que aguardam propostas de orçamento.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "categoria": {"type": "string", "description": "Categoria da demanda"}
                    }
                }
            }
        ]
    }), 200

@app.route('/')
def home():
    return "API Flask com Gemini 3.8 Flash, RAG Estruturado + Não Estruturado e MCP funcionando perfeitamente!"

if __name__ == '__main__':
    app.run(debug=True, port=8000)
