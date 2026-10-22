
import { useEffect, useState } from "react";

type Movimentacao = {
  id: number;
  descricao: string;
  tipo: "Receita" | "Despesa";
  categoria: string;
  valor: number;
  data: string;
  orcamentoId?: number;
};

function carregarMovimentacoes(): Movimentacao[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem("vetcare_financeiro") || "[]"
    );

    return Array.isArray(dados) ? dados as Movimentacao[] : [];
  } catch {
    return [];
  }
}

function Financeiro() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(
    carregarMovimentacoes
  );

  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"Receita" | "Despesa">("Receita");
  const [categoria, setCategoria] = useState("Banho e Tosa");
  const [valor, setValor] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  useEffect(() => {
    function atualizar() {
      setMovimentacoes(carregarMovimentacoes());
    }

    window.addEventListener(
      "vetcare:financeiro-atualizado",
      atualizar
    );

    return () => {
      window.removeEventListener(
        "vetcare:financeiro-atualizado",
        atualizar
      );
    };
  }, []);

  function salvarMovimentacoes(lista: Movimentacao[]) {
    localStorage.setItem(
      "vetcare_financeiro",
      JSON.stringify(lista)
    );

    setMovimentacoes(lista);
  }

  const moeda = (numero: number) =>
    numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const valorNumerico = Number(valor);

    if (
      !descricao.trim() ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      alert("Preencha os campos corretamente!");
      return;
    }

    const nova: Movimentacao = {
      id: Date.now(),
      descricao: descricao.trim(),
      tipo,
      categoria,
      valor: valorNumerico,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    salvarMovimentacoes([
      ...carregarMovimentacoes(),
      nova,
    ]);

    setDescricao("");
    setValor("");
  }

  function excluir(id: number) {
    const atualizadas = carregarMovimentacoes().filter(
      (m) => m.id !== id
    );

    salvarMovimentacoes(atualizadas);
  }

  const receitas = movimentacoes
    .filter((m) => m.tipo === "Receita")
    .reduce((total, m) => total + m.valor, 0);

  const despesas = movimentacoes
    .filter((m) => m.tipo === "Despesa")
    .reduce((total, m) => total + m.valor, 0);

  const saldo = receitas - despesas;

  const filtradas = movimentacoes.filter(
    (m) => filtro === "Todas" || m.tipo === filtro
  );

  return (
    <section>
      <div className="boas-vindas">
        <h2>Controle Financeiro e Fluxo de Caixa</h2>
        <p>
          Acompanhe receitas, despesas e resultados do VetCare.
        </p>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Receitas</h3>
          <h2>{moeda(receitas)}</h2>
        </div>

        <div className="card">
          <h3>Despesas</h3>
          <h2>{moeda(despesas)}</h2>
        </div>

        <div className="card">
          <h3>Saldo líquido</h3>
          <h2>{moeda(saldo)}</h2>
        </div>
      </div>

      <div className="card">
        <h3>Nova movimentação</h3>

        <form onSubmit={cadastrar}>
          <input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />

          <select
            value={tipo}
            onChange={(e) =>
              setTipo(e.target.value as "Receita" | "Despesa")
            }
          >
            <option value="Receita">Receita</option>
            <option value="Despesa">Despesa</option>
          </select>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option>Banho e Tosa</option>
            <option>Consultas</option>
            <option>Produtos</option>
            <option>Insumos</option>
            <option>Funcionários</option>
            <option>Outros</option>
          </select>

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Valor (R$)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />

          <button type="submit">
            Registrar movimentação
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Histórico financeiro</h3>

        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="Todas">Todas</option>
          <option value="Receita">Receitas</option>
          <option value="Despesa">Despesas</option>
        </select>

        {filtradas.length === 0 ? (
          <p>Nenhuma movimentação encontrada.</p>
        ) : (
          filtradas.map((m) => (
            <div key={m.id}>
              <h4>{m.descricao}</h4>
              <p>Tipo: {m.tipo}</p>
              <p>Categoria: {m.categoria}</p>
              <p>Data: {m.data}</p>
              <p>Valor: {moeda(m.valor)}</p>

              <button
                type="button"
                onClick={() => excluir(m.id)}
              >
                Excluir
              </button>

              <hr />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Financeiro;
