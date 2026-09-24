import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
import google.generativeai as genai

# --- 1. Inicialização da Aplicação Flask ---
app = Flask(__name__)
# Habilita CORS para permitir que o seu PWA (no Firebase Hosting ou local) faça chamadas
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- 2. Inicialização do Firebase Admin SDK ---
# Caminho exato para a chave que descarregou e enviou para o PythonAnywhere
CRED_PATH = "/home/marlonkipson/serviceAccountKey.json"

if not firebase_admin._apps:
    if os.path.exists(CRED_PATH):
        cred = credentials.Certificate(CRED_PATH)
        firebase_admin.initialize_app(cred)
    else:
        # Tenta inicialização com credenciais de ambiente caso o ficheiro não esteja na raiz
        firebase_admin.initialize_app()

db = firestore.client()

# --- 3. Configuração do Google Gemini ---
# Lembre-se de definir a variável de ambiente GEMINI_API_KEY no PythonAnywhere
# ou colocar a chave diretamente aqui (NÃO RECOMENDADO para produção)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "SUA_CHAVE_AQUI_SE_NAO_USAR_ENV"))

# Inicializa o modelo
modelo = genai.GenerativeModel('gemini-1.5-flash')

# --- 4. Rotas da API ---

@app.route('/api/chat', methods=['POST'])
def chat_inteligente():
    try:
        dados = request.get_json()
        if not dados:
            return jsonify({"erro": "Nenhum dado fornecido"}), 400
            
        mensagem_usuario = dados.get('mensagem', '')
        uid = dados.get('uid', '')
        
        if not mensagem_usuario:
            return jsonify({"erro": "Mensagem vazia"}), 400

        # Contexto do Usuário
        contexto_usuario = "Usuário Anônimo"
        if uid:
            user_ref = db.collection('usuarios').document(uid)
            user_doc = user_ref.get()
            if user_doc.exists():
                u_data = user_doc.to_dict()
                contexto_usuario = f"Nome: {u_data.get('nome')}, Tipo: {u_data.get('tipo', 'desconhecido')}"

        # --- RAG ESTRUTURADO: Buscar Serviços Ativos ---
        # Limitamos a 50 para não sobrecarregar o contexto do prompt
        servicos_ref = db.collection('servicos_avulsos').limit(50)
        servicos_docs = servicos_ref.stream()
        
        lista_servicos = []
        for doc in servicos_docs:
            s_data = doc.to_dict()
            lista_servicos.append(
                f"- Título: {s_data.get('titulo')} | "
                f"Categoria: {s_data.get('categoria')} / {s_data.get('subcategoria')} | "
                f"Valor base: R$ {s_data.get('valor', 0)}"
            )
            
        texto_servicos = "\n".join(lista_servicos) if lista_servicos else "Nenhum serviço avulso disponível no momento."

        # --- CONSTRUÇÃO DO PROMPT (MCP/RAG Concept) ---
        prompt_sistema = f"""
Você é o assistente inteligente da plataforma de serviços.
Sua principal função é ajudar os usuários a encontrarem serviços avulsos cadastrados na plataforma.

INFORMAÇÕES DO USUÁRIO ATUAL:
{contexto_usuario}

BASE DE DADOS DE SERVIÇOS AVULSOS (RAG - Única fonte de verdade):
{texto_servicos}

PERGUNTA DO USUÁRIO:
{mensagem_usuario}

REGRAS ESTritas (Siga rigorosamente para evitar alucinações):
1. NUNCA invente serviços, preços, prestadores ou categorias que não estejam na "BASE DE DADOS" acima.
2. Se o usuário procurar um serviço e ele constar na base, informe o título, categoria e valor base.
3. Se o serviço NÃO existir na base, NÃO INVENTE. Diga exatamente: "No momento não encontrei nenhum prestador oferecendo este serviço avulso. Por favor, vá ao painel e crie uma 'Nova Solicitação'."
4. Responda de forma curta, prestativa e amigável (use Markdown).
"""

        # --- CHAMADA AO GEMINI ---
        resposta = modelo.generate_content(prompt_sistema)
        texto_resposta = resposta.text
        
        return jsonify({
            "resposta": texto_resposta
        }), 200

    except Exception as e:
        print(f"Erro na API de chat: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/')
def home():
    return "API Flask com Gemini, Firebase e CORS funcionando perfeitamente!"

# Necessário para rodar localmente, o PythonAnywhere usa WSGI
if __name__ == '__main__':
    app.run(debug=True, port=8000)
