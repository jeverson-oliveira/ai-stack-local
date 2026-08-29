# FAQ Produto

**P: O sistema funciona offline?**
R: Sim, 100% local. Nenhum dado sai da máquina. Ollama + Qdrant + embeddings rodam em Docker.

**P: Qual hardware mínimo?**
R: 8GB RAM para phi3 (3.8B), 16GB recomendado para llama3:8b. CPU-only funciona; GPU NVIDIA acelera 3-5x.

**P: Quanto custa vs OpenAI?**
R: Custo marginal $0 após setup. OpenAI gpt-4o-mini ~ $0.15/1M input tokens. Em 100k queries/mês economiza ~$150-400.

**P: Como troca o modelo?**
R: `docker exec ollama ollama pull llama3` e `LLM_MODEL=llama3` no .env.
