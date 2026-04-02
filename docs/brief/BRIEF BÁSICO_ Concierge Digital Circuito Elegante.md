# **BRIEF BÁSICO: Concierge Digital Circuito Elegante**

**Data:** Abril / 2026 **Versão:** 1.0

## **1\. SUPER PROBLEMA**

Clientes de altíssimo padrão (luxo) buscam atendimento rápido, humanizado e preciso para planejar suas viagens no Circuito Elegante. O gargalo atual é que a rede possui 86 hotéis com níveis tecnológicos mistos (36 integrados via API Elevare e 50 operando manualmente). Atender dúvidas vagas ("quero praia para casal"), responder perguntas específicas de infraestrutura e fazer cotações toma muito tempo do concierge humano, atrasando a jornada de conversão e gerando atrito na experiência de luxo.

## **2\. SOLUÇÃO PROPOSTA**

Um "Concierge Digital" (Agente de IA Multi-LLM) que funciona como a linha de frente do atendimento. Ele atua como um orquestrador invisível: qualifica o desejo do hóspede de forma natural, consulta dados estruturados (região, cupons, experiência) e não estruturados (FAQs em `.md`) e decide dinamicamente o fechamento da venda. Se o hotel tem API, ele conclui gerando o link de pagamento; se não tem (ou a dúvida é sensível), ele transfere a conversa para o humano já com todo o contexto mastigado.

## **3\. DIFERENCIAIS CRÍTICOS**

* **Diferencial 1 (Arquitetura 2026):** Fim do classificador de intenção linear. Uso de *Agentic Workflow* (Orquestrador de raciocínio \+ Persona de conversação) para lidar com múltiplas perguntas na mesma frase.  
* **Diferencial 2 (Banco Híbrido):** Cruzamento exato de queries estruturadas (CSV para descontos Bradesco, Região, Status de API) com RAG/VectorDB (Markdown para saber se "a piscina é aquecida"). Zero alucinação.  
* **Diferencial 3 (Transbordo Elegante):** O handover para o humano não é um "erro do robô", mas uma ação planejada de luxo para os 50 hotéis manuais, repassando o histórico completo (Entity Memory).

## **4\. ESCOPO BOUNDARIES**

### **4.1 O que o Agente FAZ (MVP):**

* \[x\] Filtro progressivo de hotéis por experiência (Praia, Serra, etc.) base no CSV.  
* \[x\] Consulta de disponibilidade e preço via API Elevare (para os 36 hotéis integrados).  
* \[x\] Geração e entrega de Link de Pagamento da Elevare.  
* \[x\] Consulta de status de reservas existentes via API.  
* \[x\] RAG nos arquivos Markdown para dúvidas específicas de infraestrutura.  
* \[x\] Handover para humano com resumo de contexto.  
* \[x\] Defesa ativa contra Prompt Injection (barreira de segurança).

### **4.2 O que o Agente NÃO FAZ (Fora do Escopo):**

* \[ \] **NÃO** realiza o processamento financeiro nativo (aplica apenas o link externo).  
* \[ \] **NÃO** altera ou cancela reservas (apenas consulta o status; mudanças vão pro humano).  
* \[ \] **NÃO** negocia descontos fora da regra de negócio documentada (ex: Cupom Bradesco 10%).

## **5\. MÉTRICAS DE SUCESSO (KPIs)**

* **Métrica 1:** Tempo de resposta da API Elevare traduzido para o usuário em \< 5 segundos.  
* **Métrica 2:** 100% de acurácia na entrega de informações tabulares (Preço e Regra do Bradesco).  
* **Métrica 3:** Taxa de transbordo bem-sucedido (contexto íntegro chegando ao humano sem perda de dados).  
* **Métrica 4:** Zero violações de Prompt Injection reportadas.

## 

## **6\. ARQUITETURA MULTI-AGENTE (Substituindo o Classificador)**

Em vez de um "pedágio" que tenta adivinhar o que o usuário quer logo no início, usaremos um **Orquestrador de Raciocínio (Reasoning Orchestrator)**.

### **1.1 O Papel do Orquestrador (Motor Sugerido: Google Gemini)**

* **Compreensão Paralela:** Se o usuário fizer 2 ou 3 perguntas misturadas (Ex: *“Tem algum na praia com promo? E aquele de Tiradentes aceita pet?”*), o Orquestrador divide isso em sub-tarefas simultâneas em frações de segundo.  
* **Funil Dinâmico (Progressive Disclosure):** Se o usuário for vago (*"Quero um lugar legal para casal"*), o Orquestrador não tenta classificar a intenção de reserva. Ele aciona a ferramenta de **Busca Estruturada** para ver as opções "Românticas" na sua base (que você forneceu no CSV) e orienta o modelo de Conversação a fazer perguntas abertas de afunilamento (*"Perfeito. Temos refúgios incríveis no campo ou praias exclusivas. O que mais combina com vocês agora?"*).  
* **Decisão de Transbordo Orgânica:** O transbordo para o humano não é um "Erro de fluxo", mas uma ferramenta (*Tool/Function Call*). O Orquestrador chama o humano no momento exato em que percebe que o hotel escolhido é da lista dos 50 manuais, passando todo o resumo do funil.

### **1.2 O Papel do Concierge de Diálogo (Motor Sugerido: OpenAI)**

* Recebe as ordens e os dados do Orquestrador (ex: os resultados crus da API da Elevare) e os transforma em prosa luxuosa, empática e acolhedora, sem nunca parecer um robô listando parâmetros.

---

## **7\. ESTRATÉGIA DE DADOS E MEMÓRIA (2026 BEST PRACTICES)**

Não usaremos apenas um banco de dados, mas uma abordagem **Híbrida (Hybrid RAG)** que o Claude Code/AIOX precisará implementar:

### **2.1 Dados Estruturados (A Tabela CSV)**

Os dados que você enviou (Região, Experiência, Cupom Bradesco, `hotel_id`, Flag de API) devem ser armazenados em um banco relacional ou de documentos rápido (ex: **PostgreSQL com JSONB** ou Supabase).

* *Por quê?* Quando o usuário pede "Praia e Desconto Bradesco", não devemos usar IA generativa para "ler" textos e adivinhar. O Orquestrador executa uma query exata no banco de dados e retorna os hotéis perfeitos instantaneamente. Isso economiza tokens e garante 100% de precisão (Zero alucinação).

### **2.2 Dados Não-Estruturados / Base de Conhecimento (Os Arquivos .MD)**

Cada um dos 86 hotéis terá um arquivo Markdown (`.md`) formatado (Ex: `faq_hotel_tiradentes.md`).

* **A Prática de 2026 (Semantic Chunking & Vector DB):** Esses arquivos .md serão fatiados (chunked) por cabeçalho (ex: `## Piscinas`, `## Restaurante`) e inseridos em um Banco de Dados Vetorial (como Pinecone, Qdrant ou pgvector).  
* Quando o usuário pergunta "Tem piscina aquecida no hotel de Tiradentes?", o Orquestrador faz uma busca vetorial *apenas* nos chunks relacionados ao hotel de Tiradentes, extrai a resposta e manda o modelo de conversação responder.

### **2.3 Memória de Sessão (State Management)**

O agente usará uma memória de "Entidade Ativa". Se a pessoa iniciou falando de Trancoso, o sistema crava no estado da sessão: `active_hotel: Bahia Bonita`. Qualquer pergunta subsequente ("Tem banheira?") será filtrada automaticamente para o contexto desse hotel, até que o usuário mude de assunto.

---

## **8\. ESPECIFICAÇÃO DE DESENVOLVIMENTO (PARA O CLAUDE CODE \+ AIOX)**

### **3.1 Stack Tecnológica e Framework**

* **Orquestração de Agentes:** Framework baseado em LangGraph, CrewAI ou AutoGen (padrões de 2026 para multi-agentes modulares).  
* **LLM Routing:** Configuração flexível para usar Gemini Pro (Agent/Tools) e OpenAI (Generation/Response).  
* **Banco de Dados Híbrido:** PostgreSQL com extensão `pgvector` (resolve estrutura e vetorização no mesmo lugar).

### **3.2 Ferramentas (Tools/Functions) que o Claude Code deve programar para o Orquestrador:**

O Orquestrador terá acesso a um "cinto de utilidades" via Function Calling. O Claude Code deve criar as seguintes funções:

1. `Google Hotels(experience, region, has_promo)`: Filtra o SQL baseado na vontade do usuário (usando dados do seu CSV).  
2. `query_hotel_knowledge(hotel_name, question)`: Faz a busca RAG no banco vetorial dos arquivos `.md` do hotel específico.  
3. `check_api_availability(hotel_id, dates)`: Bate na API da Elevare.  
4. `generate_payment_link(hotel_id, room_id, guest_data)`: Finaliza via API Elevare.  
5. `check_reservation_status(reservation_code)`: Consulta pós-venda.  
6. `transfer_to_human_concierge(reason, context_summary)`: Acionada para os 50 hotéis não-integrados ou em caso de dúvidas sensíveis.

### **3.3 Tratamento de Multi-Intenções (Core Requirement)**

O código deve prever que a entrada do usuário passa por uma etapa de **Decomposição de Prompt**.

* Exemplo do Usuário: *"Vou pro Clara Dourado final do ano, como é a recreação infantil lá? E consegue ver se tem vaga pro natal?"*  
* O sistema deve paralelizar: `query_hotel_knowledge(Clara Dourado, recreação)` E `check_api_availability(ID 13652, Natal)`. Em seguida, junta as duas respostas numa só mensagem luxuosa.

---

## **9\. PROMPT DE ENTRADA (STARTUP) PARA O CLAUDE CODE / AIOX**

Aqui está o comando exato que você deve passar para sua ferramenta de codificação iniciar o trabalho de forma limpa, sem gerar "puxadinhos":

"Claude, estou usando você via AIOX para desenvolver a infraestrutura e backend de um Agente de IA Multi-LLM para um Concierge de Luxo. Esqueça sistemas legados de roteamento de intenção. Vamos construir um **Agentic Workflow** (preferencialmente usando conceitos de LangGraph ou framework similar moderno).

**Diretrizes Arquitetônicas:**

1. **Data Layer Híbrida:** Crie scripts de ingestão. Os dados tabulares (região, cupom Bradesco, IDs da Elevare, etc) devem ir para um banco estruturado (ex: SQLite/Postgres). As FAQs dos hotéis virão em Markdown (`.md`) e devem ser processadas com Semantic Chunking para um Vector DB.  
2. **Multi-Agent Setup:** O sistema terá uma camada de "Orquestrador" (configurável para usar Gemini API para raciocínio e tool calling) que decide quais ferramentas usar, gerencia a memória da entidade ativa (qual hotel o usuário está focando) e lida com multi-intenções paralelizando chamadas de ferramentas. E uma camada de "Persona/Conversação" (configurável para OpenAI API) que formula a resposta final.  
3. **Ferramentas Obrigatórias:** Implemente as interfaces/mocks para: `Google Hotels_sql`, `search_knowledge_base_rag`, `elevare_check_availability`, `elevare_create_link`, e `handover_to_human`.  
4. **Handover:** A ferramenta de handover deve compilar um sumário da sessão e ser acionada imediatamente caso o hotel escolhido tenha a flag `has_api: false` e o usuário demonstre intenção de compra.

Baseie a estrutura do projeto nisso. Inicie criando o schema do banco híbrido e as assinaturas das Tools do orquestrador."

