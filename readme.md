# LOCAL AI STACK

> Infraestrutura local de IA com Ollama + OpenWebUI + Docker Native em ambiente Ubuntu Linux.

<p align="center">
  <img src="https://img.shields.io/badge/Ollama-Local%20LLM-blue?style=for-the-badge&logo=ollama" />
  <img src="https://img.shields.io/badge/OpenWebUI-Interface%20AI-00c2ff?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-Native-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Ubuntu-22.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" />
</p>

---

# 🚀 Sobre o Projeto

Este projeto demonstra uma stack moderna de IA local utilizando:

- 🧠 **Ollama** para execução de modelos LLM localmente
- 💬 **OpenWebUI** como interface web estilo ChatGPT
- 🐳 **Docker Native** para isolamento e gerenciamento dos serviços
- ⚡ Ambiente otimizado para desenvolvimento e automação local
- 🔒 Infraestrutura privada e sem dependência de cloud

---

# 🏗️ Arquitetura

```txt
┌─────────────────────┐
│     OpenWebUI       │
│  Interface Web AI   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       Ollama        │
│   Local LLM Engine  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Docker Network    │
│  Containers Native  │
└─────────────────────┘