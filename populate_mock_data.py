import os
import random
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# MOCK DATA CONFIGURATION
USERS = [
    {"uid": "mock_prestador_1", "nome": "Carlos Eletricista", "email": "carlos@mock.com", "tipo": "prestador"},
    {"uid": "mock_prestador_2", "nome": "Ana Limpeza", "email": "ana@mock.com", "tipo": "ambos"},
    {"uid": "mock_prestador_3", "nome": "Tech Solutions TI", "email": "tech@mock.com", "tipo": "prestador"},
    {"uid": "mock_prestador_4", "nome": "Marcos Encanador", "email": "marcos@mock.com", "tipo": "prestador"},
]

SERVICOS = [
    {
        "prestador_uid": "mock_prestador_1",
        "titulo": "Instalação de Ventilador de Teto",
        "categoria": "Casa e Jardim",
        "subcategoria": "Elétrica",
        "descricao": "Instalação completa de ventilador de teto com passagem de fios e balanceamento.",
        "valor_base": 150.00
    },
    {
        "prestador_uid": "mock_prestador_1",
        "titulo": "Troca de Resistência de Chuveiro",
        "categoria": "Casa e Jardim",
        "subcategoria": "Elétrica",
        "descricao": "Troca rápida de resistência de chuveiros multimarcas.",
        "valor_base": 80.00
    },
    {
        "prestador_uid": "mock_prestador_2",
        "titulo": "Faxina Completa Pós-Obra",
        "categoria": "Casa e Jardim",
        "subcategoria": "Limpeza",
        "descricao": "Limpeza pesada pós-obra incluindo remoção de respingos de tinta e cimento.",
        "valor_base": 350.00
    },
    {
        "prestador_uid": "mock_prestador_2",
        "titulo": "Limpeza de Piscina Mensal",
        "categoria": "Casa e Jardim",
        "subcategoria": "Piscinas",
        "descricao": "Pacote mensal com 4 visitas para aspiração, controle de PH e cloro.",
        "valor_base": 400.00
    },
    {
        "prestador_uid": "mock_prestador_3",
        "titulo": "Formatação de Computador",
        "categoria": "Tecnologia",
        "subcategoria": "Informática",
        "descricao": "Formatação com backup, instalação de Windows, pacote Office e antivírus.",
        "valor_base": 120.00
    },
    {
        "prestador_uid": "mock_prestador_3",
        "titulo": "Configuração de Roteador Wi-Fi",
        "categoria": "Tecnologia",
        "subcategoria": "Redes",
        "descricao": "Configuração de repetidores e roteadores para melhorar o sinal da casa.",
        "valor_base": 90.00
    },
    {
        "prestador_uid": "mock_prestador_4",
        "titulo": "Caça Vazamentos",
        "categoria": "Casa e Jardim",
        "subcategoria": "Manutenção",
        "descricao": "Detecção de vazamentos ocultos utilizando aparelho geofone de alta precisão.",
        "valor_base": 250.00
    },
    {
        "prestador_uid": "mock_prestador_4",
        "titulo": "Desentupimento de Pia",
        "categoria": "Casa e Jardim",
        "subcategoria": "Manutenção",
        "descricao": "Desentupimento rápido de pias de cozinha e banheiro sem quebrar a parede.",
        "valor_base": 150.00
    }
]

def populate_db():
    print("Inicializando Firebase...")
    cred_path = "serviceAccountKey.json" # Assume que está na mesma pasta rodando local
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("Erro: serviceAccountKey.json não encontrado para criar dados mock.")
        return

    db = firestore.client()
    
    print("Criando usuários de teste...")
    for u in USERS:
        doc_ref = db.collection("usuarios").document(u["uid"])
        doc_ref.set({
            "nome": u["nome"],
            "email": u["email"],
            "tipo": u["tipo"],
            "criadoEm": firestore.SERVER_TIMESTAMP
        })
        print(f"  -> Usuário {u['nome']} criado.")

    print("Criando serviços avulsos de teste...")
    # Limpar mocks antigos (opcional, mas bom pra não duplicar)
    docs = db.collection("servicos_avulsos").where("titulo", "in", [s["titulo"] for s in SERVICOS]).stream()
    for doc in docs:
        doc.reference.delete()

    for s in SERVICOS:
        s["ativo"] = True
        s["criadoEm"] = firestore.SERVER_TIMESTAMP
        db.collection("servicos_avulsos").add(s)
        print(f"  -> Serviço '{s['titulo']}' cadastrado.")
        
    print("Processo finalizado com sucesso! Seu banco agora tem dados fictícios para testar o Gemini.")

if __name__ == "__main__":
    populate_db()
