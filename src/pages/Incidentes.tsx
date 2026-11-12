
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Gravidade = "Baixa" | "Média" | "Alta" | "Crítica";

type StatusIncidente =
  | "Aberto"
  | "Em tratamento"
  | "Resolvido";

type Incidente = {
  id: string;
  titulo: string;
  tipo: string;
  descricao: string;
  consequencia: string;
  responsavel: string;
  gravidade: Gravidade;
  procedimento: string;
  status: StatusIncidente;
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
  incidenteId?: string;
};

const CHAVE = "vetcare-incidentes";
const CHAVE_TAREFAS = "vetcare-tarefas";

function carregarLista<T>(chave: string): T[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem(chave) || "[]"
    );

    return Array.isArray(dados) ? dados as T[] : [];
  } catch {
    return [];
  }
}

function Incidentes() {
  const [incidentes, setIncidentes] = useState<Incidente[]>(
    () => carregarLista<Incidente>(CHAVE)
  );

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("Equipamento");
  const [descricao, setDescricao] = useState("");
  const [consequencia, setConsequencia] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [gravidade, setGravidade] =
    useState<Gravidade>("Média");
  const [procedimento, setProcedimento] = useState("");

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<
    "Todos" | StatusIncidente
  >("Todos");

  useEffect(() => {
    localStorage.setItem(
      CHAVE,
      JSON.stringify(incidentes)
    );
  }, [incidentes]);

  // INDICADORES
  const total = incidentes.length;

  const abertos = incidentes.filter(
    (i) => i.status === "Aberto"
  ).length;

  const tratamento = incidentes.filter(
    (i) => i.status === "Em tratamento"
  ).length;

  const resolvidos = incidentes.filter(
    (i) => i.status === "Resolvido"
  ).length;

  // INTEGRAÇÃO COM TAREFAS
  function gerarTarefa(incidente: Incidente): boolean {
    try {
      const tarefas = carregarLista<TarefaIntegrada>(
        CHAVE_TAREFAS
      );

      const tarefaExistente = tarefas.some(
        (t) => t.incidenteId === incidente.id
      );

      if (tarefaExistente) {
        return true;
      }

      const novaTarefa: TarefaIntegrada = {
        id: crypto.randomUUID(),

        titulo: `Resolver incidente: ${incidente.titulo}`,

        descricao:
          `Incidente: ${incidente.tipo}. ` +
          `Descrição: ${incidente.descricao}. ` +
          `Consequência: ${incidente.consequencia}. ` +
          `Procedimento: ${
            incidente.procedimento || "A definir"
          }`,

        responsavel: incidente.responsavel,

        prioridade:
          incidente.gravidade === "Alta" ||
          incidente.gravidade === "Crítica"
            ? "Alta"
            : incidente.gravidade === "Média"
              ? "Média"
              : "Baixa",

        status: "Pendente",

        dataCriacao: new Date().toLocaleString("pt-BR"),

        incidenteId: incidente.id,
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

  // CADASTRAR INCIDENTE
  function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !titulo.trim() ||
      !descricao.trim() ||
      !consequencia.trim() ||
      !responsavel.trim()
    ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const novo: Incidente = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      tipo,
      descricao: descricao.trim(),
      consequencia: consequencia.trim(),
      responsavel: responsavel.trim(),
      gravidade,
      procedimento: procedimento.trim(),
      status: "Aberto",
      data: new Date().toLocaleString("pt-BR"),
    };

    // Cria a tarefa corretiva antes de finalizar o cadastro
    if (!gerarTarefa(novo)) {
      alert("Não foi possível criar a tarefa corretiva.");
      return;
    }

    setIncidentes((anteriores) => [
      novo,
      ...anteriores,
    ]);

    // Limpa o formulário
    setTitulo("");
    setTipo("Equipamento");
    setDescricao("");
    setConsequencia("");
    setResponsavel("");
    setGravidade("Média");
    setProcedimento("");
  }

  // ALTERAR SOMENTE O STATUS
  function alterarStatus(
    id: string,
    novoStatus: StatusIncidente
  ) {
    setIncidentes((anteriores) =>
      anteriores.map((incidente) =>
        incidente.id === id
          ? { ...incidente, status: novoStatus }
          : incidente
      )
    );
  }

  // EXCLUIR INCIDENTE
  function excluir(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este incidente?"
    );

    if (!confirmar) {
      return;
    }

    setIncidentes((anteriores) =>
      anteriores.filter((incidente) =>
        incidente.id !== id
      )
    );
  }

  // PESQUISA E FILTROS
  const filtrados = incidentes.filter((incidente) => {
    const correspondeStatus =
      filtro === "Todos" ||
      incidente.status === filtro;

    const texto = [
      incidente.titulo,
      incidente.tipo,
      incidente.descricao,
      incidente.consequencia,
      incidente.responsavel,
      incidente.procedimento,
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    return (
      correspondeStatus &&
      texto.includes(
        busca.toLocaleLowerCase("pt-BR")
      )
    );
  });

  return (
    <section className="incidentes-modulo">
      <div className="boas-vindas">
        <h2>Gestão de Incidentes Operacionais</h2>

        <p>
          Registre ocorrências, acompanhe soluções e
          mantenha o histórico operacional da clínica.
        </p>
      </div>

      {/* INDICADORES */}
      <div className="cards">
        <div className="card">
          <h3>Total de incidentes</h3>
          <h2>{total}</h2>
        </div>

        <div className="card">
          <h3>Abertos</h3>
          <h2>{abertos}</h2>
        </div>

        <div className="card">
          <h3>Em tratamento</h3>
          <h2>{tratamento}</h2>
        </div>

        <div className="card">
          <h3>Resolvidos</h3>
          <h2>{resolvidos}</h2>
        </div>
      </div>

      {/* CADASTRO */}
      <div className="card">
        <h3>Registrar novo incidente</h3>

        <p>
          As informações registradas não poderão ser
          editadas posteriormente, exceto o status.
        </p>

        <form
          className="incidentes-form"
          onSubmit={cadastrar}
        >
          <label>
            Título do incidente

            <input
              type="text"
              placeholder="Ex.: Máquina de tosa quebrada"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </label>

          <label>
            Categoria

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option>Equipamento</option>
              <option>Atendimento</option>
              <option>Estoque</option>
              <option>Higiene e Segurança</option>
              <option>Agendamento</option>
              <option>Outros</option>
            </select>
          </label>

          <label>
            Gravidade

            <select
              value={gravidade}
              onChange={(e) =>
                setGravidade(
                  e.target.value as Gravidade
                )
              }
            >
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </label>

          <label>
            Responsável

            <input
              type="text"
              placeholder="Ex.: Técnico João"
              value={responsavel}
              onChange={(e) =>
                setResponsavel(e.target.value)
              }
              required
            />
          </label>

          <label className="incidentes-largo">
            Descrição do incidente

            <textarea
              rows={3}
              placeholder="Descreva o ocorrido..."
              value={descricao}
              onChange={(e) =>
                setDescricao(e.target.value)
              }
              required
            />
          </label>

          <label className="incidentes-largo">
            Consequências

            <textarea
              rows={2}
              placeholder="Quais foram os impactos?"
              value={consequencia}
              onChange={(e) =>
                setConsequencia(e.target.value)
              }
              required
            />
          </label>

          <label className="incidentes-largo">
            Procedimento de solução

            <textarea
              rows={2}
              placeholder="Como o problema será resolvido?"
              value={procedimento}
              onChange={(e) =>
                setProcedimento(e.target.value)
              }
            />
          </label>

          <button type="submit">
            + Registrar incidente
          </button>
        </form>
      </div>

      {/* LISTAGEM */}
      <div className="card">
        <h3>Incidentes registrados</h3>

        <div className="incidentes-filtros">
          <input
            type="search"
            placeholder="Pesquisar incidentes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <select
            value={filtro}
            onChange={(e) =>
              setFiltro(
                e.target.value as
                  "Todos" | StatusIncidente
              )
            }
          >
            <option value="Todos">Todos</option>
            <option value="Aberto">Abertos</option>
            <option value="Em tratamento">
              Em tratamento
            </option>
            <option value="Resolvido">
              Resolvidos
            </option>
          </select>
        </div>

        {filtrados.length === 0 ? (
          <p>Nenhum incidente encontrado.</p>
        ) : (
          <div className="incidentes-lista">
            {filtrados.map((incidente) => (
              <article
                className="incidentes-item"
                key={incidente.id}
              >
                <h3>{incidente.titulo}</h3>

                <p>
                  <strong>Categoria:</strong>{" "}
                  {incidente.tipo}
                </p>

                <p>
                  <strong>Gravidade:</strong>{" "}
                  {incidente.gravidade}
                </p>

                <p>
                  <strong>Descrição:</strong>{" "}
                  {incidente.descricao}
                </p>

                <p>
                  <strong>Consequência:</strong>{" "}
                  {incidente.consequencia}
                </p>

                <p>
                  <strong>Responsável:</strong>{" "}
                  {incidente.responsavel}
                </p>

                <p>
                  <strong>Procedimento de solução:</strong>{" "}
                  {incidente.procedimento ||
                    "Não informado"}
                </p>

                <p>
                  <strong>Data do registro:</strong>{" "}
                  {incidente.data}
                </p>

                {/* ÚNICO CAMPO EDITÁVEL */}
                <label>
                  Status do incidente

                  <select
                    value={incidente.status}
                    onChange={(e) =>
                      alterarStatus(
                        incidente.id,
                        e.target.value as
                          StatusIncidente
                      )
                    }
                  >
                    <option value="Aberto">
                      Aberto
                    </option>

                    <option value="Em tratamento">
                      Em tratamento
                    </option>

                    <option value="Resolvido">
                      Resolvido
                    </option>
                  </select>
                </label>

                <p className="incidentes-vinculo">
                  Tarefa corretiva vinculada ao módulo
                  de Controle de Tarefas.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    excluir(incidente.id)
                  }
                >
                  Excluir incidente
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Incidentes;
