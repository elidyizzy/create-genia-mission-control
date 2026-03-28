# create-genia-mission-control

> Instale o GEN.IA Mission Control com um único comando.

## Uso

```bash
npx create-genia-mission-control
```

**Pré-requisito único:** Node.js 18+ — instale em [nodejs.org](https://nodejs.org)

## O que instala

O wizard configura automaticamente:

1. **Claude Code CLI** — se não estiver instalado
2. **Autenticação** — login via browser ou API key
3. **Segundo Cérebro** — seu repositório privado de contexto
4. **GEN.IA SQUAD OS** — 9 agentes de dev + 13 Xquads consultores
5. **Mission Control** — interface visual estilo Gather Town

## Após a instalação

```bash
cd seu-projeto/mission-control
node server.js
# Abre localhost:3001
```

## O Segundo Cérebro

Repositório privado no seu GitHub que os agentes leem em toda sessão.
Criado automaticamente a partir do template:
[segundo-cerebro-template](https://github.com/elidyizzy/segundo-cerebro-template)

## Três caminhos para o Segundo Cérebro

| Situação | Caminho |
|----------|---------|
| Tem GitHub + repo existente | Clona direto |
| Tem GitHub + sem repo | Cria repo privado via API |
| Sem GitHub / não quer agora | Cria localmente (pode conectar depois) |

---

Criado por [Elidy Izidio](https://github.com/elidyizzy) — GEN.IA SQUAD
