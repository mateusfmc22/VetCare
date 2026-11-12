import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Avaliacao = {
  id: string;
  cliente: string;
  pet: string;
  servico: string;
  nota: number;
  comentario: string;
  data: string;
};

type TarefaIntegrada = {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prioridade: "Baixa" | "Média" | "Alta";
  status: "Pendente" | "Em andamento" | "Concluída";
  dataCriacao: string;
  avaliacaoId?: string;
};

const CHAVE = "vetcare-satisfacao";
const CHAVE_TAREFAS = "vetcare-tarefas";

function carregarAvaliacoes(): Avaliacao[] {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    return Array.isArray(dados) ? dados as Avaliacao[] : [];
  } catch {
    return [];
  }
}

function Satisfacao() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(
    carregarAvaliacoes
  );

  const [cliente, setCliente] = useState("");
  const [pet, setPet] = useState("");
  const [servico, setServico] = useState("Banho e Tosa");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(avaliacoes));
  }, [avaliacoes]);

  const total = avaliacoes.length;

  const media = total
    ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / total
    : 0;

  const positivas = avaliacoes.filter(
    (a) => a.nota >= 4
  ).length;

  const negativas = avaliacoes.filter(
    (a) => a.nota <= 2
  ).length;

  const percentual = total
    ? (positivas / total) * 100
    : 0;

  function gerarTarefa(avaliacao: Avaliacao) {
    try {
      const dados = JSON.parse(
        localStorage.getItem(CHAVE_TAREFAS) || "[]"
      );

      const tarefas: TarefaIntegrada[] =
        Array.isArray(dados) ? dados as TarefaIntegrada[] : [];

      if (
        tarefas.some((t) => t.avaliacaoId === avaliacao.id)
      ) {
        return true;
      }

      const novaTarefa: TarefaIntegrada = {
        id: crypto.randomUUID(),
        titulo: `Investigar avaliação - ${avaliacao.pet}`,
        descricao:
          `Cliente: ${avaliacao.cliente}. ` +
          `Serviço: ${avaliacao.servico}. ` +
          `Nota: ${avaliacao.nota}/5. ` +
          `Comentário: ${avaliacao.comentario || "Não informado"}`,
        responsavel: "A definir",
        prioridade: "Alta",
        status: "Pendente",
        dataCriacao: new Date().toLocaleString("pt-BR"),
        avaliacaoId: avaliacao.id,
      };

      localStorage.setItem(
        CHAVE_TAREFAS,
        JSON.stringify([novaTarefa, ...tarefas])
      );

      return true;
    } catch (erro) {
      console.error("Erro ao gerar tarefa:", erro);
      return false;
    }
  }

  function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !cliente.trim() ||
      !pet.trim() ||
      !Number.isInteger(nota) ||
      nota < 1 ||
      nota > 5
    ) {
      alert("Preencha corretamente os campos.");
      return;
    }

    const nova: Avaliacao = {
      id: crypto.randomUUID(),
      cliente: cliente.trim(),
      pet: pet.trim(),
      servico,
      nota,
      comentario: comentario.trim(),
      data: new Date().toLocaleString("pt-BR"),
    };

    if (nota <= 2 && !gerarTarefa(nova)) {
      alert("Não foi possível criar a tarefa corretiva.");
      return;
    }

    setAvaliacoes((anteriores) => [nova, ...anteriores]);

    setCliente("");
    setPet("");
    setServico("Banho e Tosa");
    setNota(5);
    setComentario("");
  }

  function excluir(id: string) {
    if (!window.confirm("Excluir esta avaliação?")) return;

    setAvaliacoes((anteriores) =>
      anteriores.filter((a) => a.id !== id)
    );
  }

  const filtradas = avaliacoes.filter((a) =>
    `${a.cliente} ${a.pet} ${a.servico} ${a.comentario}`
      .toLocaleLowerCase("pt-BR")
      .includes(busca.toLocaleLowerCase("pt-BR"))
  );

  return (
    <section className="satisfacao-modulo">
      <div className="boas-vindas">
        <h2>Pesquisa de Satisfação</h2>
        <p>
          Avalie a experiência dos clientes e identifique
          oportunidades de melhoria.
        </p>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Avaliações recebidas</h3>
          <h2>{total}</h2>
        </div>

        <div className="card">
          <h3>Média geral</h3>
          <h2>{media.toFixed(1)} / 5</h2>
        </div>

        <div className="card">
          <h3>Satisfação positiva</h3>
          <h2>{percentual.toFixed(1)}%</h2>
        </div>

        <div className="card">
          <h3>Avaliações críticas</h3>
          <h2>{negativas}</h2>
        </div>
      </div>

      <div className="card">
        <h3>Nova avaliação</h3>

        <form className="satisfacao-form" onSubmit={cadastrar}>
          <label>
            Nome do cliente
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Ex.: Carlos Silva"
              required
            />
          </label>

          <label>
            Nome do pet
            <input
              value={pet}
              onChange={(e) => setPet(e.target.value)}
              placeholder="Ex.: Thor"
              required
            />
          </label>

          <label>
            Serviço realizado
            <select
              value={servico}
              onChange={(e) => setServico(e.target.value)}
            >
              <option>Banho e Tosa</option>
              <option>Banho</option>
              <option>Tosa</option>
              <option>Consulta Veterinária</option>
              <option>Compra de Produtos</option>
              <option>Outro Atendimento</option>
            </select>
          </label>

          <label>
            Nota do atendimento
            <select
              value={nota}
              onChange={(e) => setNota(Number(e.target.value))}
            >
              <option value={5}>5 - Excelente</option>
              <option value={4}>4 - Bom</option>
              <option value={3}>3 - Regular</option>
              <option value={2}>2 - Ruim</option>
              <option value={1}>1 - Péssimo</option>
            </select>
          </label>

          <label>
            Comentário
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Como foi a experiência?"
            />
          </label>

          {nota <= 2 && (
            <p className="satisfacao-alerta">
              Uma tarefa corretiva será criada automaticamente
              no módulo Tarefas.
            </p>
          )}

          <button type="submit">Registrar avaliação</button>
        </form>
      </div>

      <div className="card">
        <h3>Avaliações cadastradas</h3>

        <input
          className="satisfacao-busca"
          type="search"
          placeholder="Pesquisar avaliações..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {filtradas.length === 0 ? (
          <p>Nenhuma avaliação encontrada.</p>
        ) : (
          <div className="satisfacao-lista">
            {filtradas.map((a) => (
              <article className="satisfacao-item" key={a.id}>
                <h3>{a.cliente} — {a.pet}</h3>

                <p>{a.servico}</p>

                <strong className="satisfacao-estrelas">
                  {"★".repeat(a.nota)}
                  {"☆".repeat(5 - a.nota)}
                </strong>

                <p>Nota: {a.nota}/5</p>
                <p>{a.comentario || "Sem comentário."}</p>
                <small>{a.data}</small>

                {a.nota <= 2 && (
                  <p className="satisfacao-alerta">
                    Avaliação crítica — verificar tarefa corretiva.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => excluir(a.id)}
                >
                  Excluir avaliação
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Satisfacao;
