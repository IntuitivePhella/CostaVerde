# Costa Verde Barcos

Plataforma de aluguel de barcos no litoral brasileiro, similar ao AirBnB.

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase
- Stripe
- PWA

## Requisitos

- Node.js 18+
- pnpm
- Conta no Supabase
- Conta no Stripe

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd costa-verde
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_do_stripe
```

4. Execute as migrações do banco de dados:
Execute os comandos SQL fornecidos no arquivo `database.sql` no SQL Editor do Supabase.

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

## Estrutura do Projeto

```
costa-verde/
├── src/
│   ├── app/              # Rotas e páginas
│   ├── components/       # Componentes React
│   ├── lib/             # Utilitários e configurações
│   ├── types/           # Tipos TypeScript
│   └── styles/          # Estilos globais
├── public/              # Arquivos estáticos
└── prisma/             # Schema do banco de dados
```

## Funcionalidades

### Proprietários de Embarcações
- Cadastro e gerenciamento de embarcações
- Gestão de reservas
- Dashboard com métricas
- Recebimento de pagamentos

### Clientes
- Busca e filtros de embarcações
- Sistema de reservas
- Avaliações
- Favoritos

### Geral
- Autenticação
- Sistema de mensagens
- Notificações em tempo real
- Processamento de pagamentos
- Design responsivo

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Nome - email

Link do projeto: [https://github.com/seu-usuario/costa-verde](https://github.com/seu-usuario/costa-verde)
