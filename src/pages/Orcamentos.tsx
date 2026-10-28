
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Status = "Pendente" | "Aprovado" | "Recusado";

type Item = {
  nome: string;
  quantidade: number;
  preco: number;
};

type Orcamento = {
  id: number;
  cliente: string;
  pet: string;
  servico?: string;
  valor: number;
  status: Status;
  itens?: Item[];
  sessoes?: number;
  realizadas?: number;
};

type Movimentacao = {
  id: number;
  descricao: string;
  tipo: "Receita" | "Despesa";
  categoria: string;
  valor: number;
  data: string;
  orcamentoId?: number;
};

type TarefaIntegrada = {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prioridade: "Baixa" | "Média" | "Alta";
  status: "Pendente" | "Em andamento" | "Concluída";
  dataCriacao: string;
  orcamentoId?: number;
};

type ProdutoCatalogo = {
  id: number;
  nome: string;
  preco: number;
};

function lerLista<T,>(chave: string): T[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem(chave) || "[]"
    );
    return Array.isArray(dados) ? dados as T[] : [];
  } catch {
    return [];
  }
}

const servicos = [
  { nome: "Banho", preco: 50 },
  { nome: "Tosa", preco: 40 },
  { nome: "Banho e Tosa", preco: 85 },
  { nome: "Consulta Veterinária", preco: 120 },
];

const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(
    () => lerLista<Orcamento>("vetcare_orcamentos")
  );

  const [cliente, setCliente] = useState("");
  const [pet, setPet] = useState("");
  const [itens, setItens] = useState<Item[]>([]);
  const [selecionado, setSelecionado] = useState("Banho");
  const [quantidade, setQuantidade] = useState(1);
  const [sessoes, setSessoes] = useState(1);

  const [produtos] = useState<ProdutoCatalogo[]>(
    () => lerLista<ProdutoCatalogo>("vetcare_produtos")
  );

  useEffect(() => {
    localStorage.setItem(
      "vetcare_orcamentos",
      JSON.stringify(orcamentos)
    );
  }, [orcamentos]);

  const opcoes = [
    ...servicos,
    ...produtos.map((p) => ({
      nome: `Produto: ${p.nome}`,
      preco: p.preco,
    })),
  ];

  const subtotal = itens.reduce(
    (total, item) =>
      total + item.preco * item.quantidade,
    0
  );

  const total = subtotal * sessoes;

  function adicionarItem() {
    const opcao = opcoes.find(
      (item) => item.nome === selecionado
    );

    if (!opcao || quantidade < 1) return;

    setItens((anteriores) => [
      ...anteriores,
      {
        nome: opcao.nome,
        quantidade,
        preco: opcao.preco,
      },
    ]);

    setQuantidade(1);
  }

  function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!cliente.trim() || !pet.trim() || itens.length === 0) {
      alert("Informe cliente, pet e adicione ao menos um item.");
      return;
    }

    const novo: Orcamento = {
      id: Date.now(),
      cliente: cliente.trim(),
      pet: pet.trim(),
      valor: total,
      itens: [...itens],
      sessoes,
      realizadas: 0,
      status: "Pendente",
    };

    setOrcamentos((anteriores) => [...anteriores, novo]);

    setCliente("");
    setPet("");
    setItens([]);
    setQuantidade(1);
    setSessoes(1);
  }

  function alterarStatus(id: number, novoStatus: Status) {
    const orcamento = orcamentos.find((o) => o.id === id);

    if (!orcamento || orcamento.status === novoStatus) {
      return;
    }

    if (novoStatus === "Aprovado") {
      try {
        const financeiro = lerLista<Movimentacao>(
          "vetcare_financeiro"
        );

        if (!financeiro.some((m) => m.orcamentoId === id)) {
          const receita: Movimentacao = {
            id: Date.now(),
            descricao: `Pacote/serviço - ${orcamento.pet} (${orcamento.cliente})`,
            tipo: "Receita",
            categoria: "Banho e Tosa",
            valor: orcamento.valor,
            data: new Date().toLocaleDateString("pt-BR"),
            orcamentoId: id,
          };

          localStorage.setItem(
            "vetcare_financeiro",
            JSON.stringify([...financeiro, receita])
          );
        }

        const tarefas = lerLista<TarefaIntegrada>(
          "vetcare-tarefas"
        );

        if (!tarefas.some((t) => t.orcamentoId === id)) {
          const nomes = orcamento.itens?.map(
            (i) => i.nome
          ).join(", ") || orcamento.servico || "Atendimento";

          const novaTarefa: TarefaIntegrada = {
            id: crypto.randomUUID(),
            titulo: `Atendimento - ${orcamento.pet}`,
            descricao:
              `Cliente: ${orcamento.cliente}. ` +
              `Serviços: ${nomes}. ` +
              `Sessões: ${orcamento.sessoes || 1}.`,
            responsavel: "A definir",
            prioridade: "Média",
            status: "Pendente",
            dataCriacao: new Date().toLocaleString("pt-BR"),
            orcamentoId: id,
          };

          localStorage.setItem(
            "vetcare-tarefas",
            JSON.stringify([novaTarefa, ...tarefas])
          );
        }

        window.dispatchEvent(
          new Event("vetcare:financeiro-atualizado")
        );
      } catch (erro) {
        console.error(erro);
        alert("Erro ao integrar o orçamento.");
        return;
      }
    }

    setOrcamentos((anteriores) =>
      anteriores.map((o) =>
        o.id === id ? { ...o, status: novoStatus } : o
      )
    );
  }

  function registrarSessao(id: number) {
    setOrcamentos((anteriores) =>
      anteriores.map((o) => {
        if (o.id !== id || o.status !== "Aprovado") {
          return o;
        }

        const limite = o.sessoes || 1;
        const realizadas = o.realizadas || 0;

        return {
          ...o,
          realizadas: Math.min(realizadas + 1, limite),
        };
      })
    );
  }

  return (
    <section>
      <div className="boas-vindas">
        <h2>Emissor de Orçamentos e Propostas</h2>
        <p>
          Monte propostas e acompanhe pacotes de banho e tosa.
        </p>
      </div>

      <div className="card">
        <h3>Novo orçamento</h3>

        <form onSubmit={cadastrar} className="orc-form">
          <input
            placeholder="Nome do cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            required
          />

          <input
            placeholder="Nome do pet"
            value={pet}
            onChange={(e) => setPet(e.target.value)}
            required
          />

          <label>
            Sessões do pacote
            <input
              type="number"
              min="1"
              max="100"
              value={sessoes}
              onChange={(e) =>
                setSessoes(Math.max(1, Number(e.target.value)))
              }
            />
          </label>

          <h3>Selecionar serviços e produtos</h3>

          <div className="orc-linha">
            <select
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
            >
              {opcoes.map((opcao) => (
                <option key={opcao.nome} value={opcao.nome}>
                  {opcao.nome} - {moeda(opcao.preco)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(
                  Math.max(1, Number(e.target.value))
                )
              }
            />

            <button type="button" onClick={adicionarItem}>
              + Adicionar item
            </button>
          </div>

          <h3>Itens selecionados</h3>

          {itens.length === 0 ? (
            <p>Nenhum item adicionado.</p>
          ) : (
            itens.map((item, index) => (
              <div className="orc-item" key={index}>
                <span>
                  {item.nome} — {item.quantidade}x{" "}
                  {moeda(item.preco)}
                </span>

                <strong>
                  {moeda(item.preco * item.quantidade)}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setItens((anteriores) =>
                      anteriores.filter((_, i) => i !== index)
                    )
                  }
                >
                  Remover
                </button>
              </div>
            ))
          )}

          <p>Subtotal por sessão: {moeda(subtotal)}</p>
          <h3>Total do pacote: {moeda(total)}</h3>

          <button type="submit" disabled={itens.length === 0}>
            Cadastrar orçamento
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Orçamentos cadastrados</h3>

        {orcamentos.length === 0 ? (
          <p>Nenhum orçamento cadastrado.</p>
        ) : (
          orcamentos.map((orcamento) => {
            const limite = orcamento.sessoes || 1;
            const feitas = orcamento.realizadas || 0;

            return (
              <div className="orc-cadastrado" key={orcamento.id}>
                <h3>
                  {orcamento.cliente} — {orcamento.pet}
                </h3>

                {orcamento.itens ? (
                  orcamento.itens.map((item, index) => (
                    <p key={index}>
                      {item.quantidade}x {item.nome} —{" "}
                      {moeda(item.quantidade * item.preco)}
                    </p>
                  ))
                ) : (
                  <p>Serviço: {orcamento.servico}</p>
                )}

                <h3>Total: {moeda(orcamento.valor)}</h3>

                <label>
                  Status:{" "}
                  <select
                    value={orcamento.status}
                    onChange={(e) =>
                      alterarStatus(
                        orcamento.id,
                        e.target.value as Status
                      )
                    }
                  >
                    <option>Pendente</option>
                    <option>Aprovado</option>
                    <option>Recusado</option>
                  </select>
                </label>

                <p>
                  Sessões realizadas: {feitas} de {limite}
                </p>

                <progress
                  value={feitas}
                  max={limite}
                  style={{ width: "100%" }}
                />

                {orcamento.status === "Aprovado" &&
                  feitas < limite && (
                    <button
                      type="button"
                      onClick={() =>
                        registrarSessao(orcamento.id)
                      }
                    >
                      + Registrar sessão realizada
                    </button>
                  )}

                {feitas === limite &&
                  orcamento.status === "Aprovado" && (
                    <p>✅ Pacote concluído!</p>
                  )}

                <hr />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Orcamentos;
