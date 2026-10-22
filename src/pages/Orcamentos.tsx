
import { useEffect, useState } from "react";

type Orcamento = {
  id: number;
  cliente: string;
  pet: string;
  servico: string;
  valor: number;
  status: "Pendente" | "Aprovado" | "Recusado";
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

function Orcamentos() {
  const [cliente, setCliente] = useState("");
  const [pet, setPet] = useState("");
  const [servico, setServico] = useState("Banho");
  const [valor, setValor] = useState("");

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    try {
      const dados = JSON.parse(
        localStorage.getItem("vetcare_orcamentos") || "[]"
      );
      return Array.isArray(dados) ? dados as Orcamento[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "vetcare_orcamentos",
      JSON.stringify(orcamentos)
    );
  }, [orcamentos]);

  const moeda = (numero: number) =>
    numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  function cadastrarOrcamento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const valorNumerico = Number(valor);

    if (
      !cliente.trim() ||
      !pet.trim() ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const novo: Orcamento = {
      id: Date.now(),
      cliente: cliente.trim(),
      pet: pet.trim(),
      servico,
      valor: valorNumerico,
      status: "Pendente",
    };

    setOrcamentos((anteriores) => [...anteriores, novo]);

    setCliente("");
    setPet("");
    setServico("Banho");
    setValor("");
  }

  function alterarStatus(
    id: number,
    novoStatus: Orcamento["status"]
  ) {
    const orcamento = orcamentos.find((o) => o.id === id);

    if (!orcamento || orcamento.status === novoStatus) {
      return;
    }

    if (novoStatus === "Aprovado") {
      try {
        const dados = JSON.parse(
          localStorage.getItem("vetcare_financeiro") || "[]"
        );

        const movimentacoes: Movimentacao[] =
          Array.isArray(dados) ? dados as Movimentacao[] : [];

        const existe = movimentacoes.some(
          (m) => m.orcamentoId === id
        );

        if (!existe) {
          const receita: Movimentacao = {
            id: Date.now(),
            descricao: `${orcamento.servico} - ${orcamento.pet} (${orcamento.cliente})`,
            tipo: "Receita",
            categoria: "Banho e Tosa",
            valor: orcamento.valor,
            data: new Date().toLocaleDateString("pt-BR"),
            orcamentoId: id,
          };

          localStorage.setItem(
            "vetcare_financeiro",
            JSON.stringify([...movimentacoes, receita])
          );

          window.dispatchEvent(
            new Event("vetcare:financeiro-atualizado")
          );
        }
      } catch {
        alert("Erro ao registrar receita no financeiro.");
        return;
      }
    }

    setOrcamentos((anteriores) =>
      anteriores.map((o) =>
        o.id === id ? { ...o, status: novoStatus } : o
      )
    );
  }

  return (
    <section>
      <div className="boas-vindas">
        <h2>Emissor de Orçamentos e Propostas</h2>
        <p>
          Gerencie propostas para serviços veterinários,
          banho e tosa.
        </p>
      </div>

      <div className="card">
        <h3>Novo orçamento</h3>

        <form onSubmit={cadastrarOrcamento}>
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

          <select
            value={servico}
            onChange={(e) => setServico(e.target.value)}
          >
            <option>Banho</option>
            <option>Tosa</option>
            <option>Banho e Tosa</option>
            <option>Consulta Veterinária</option>
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

          <button type="submit">Cadastrar orçamento</button>
        </form>
      </div>

      <div className="card">
        <h3>Orçamentos cadastrados</h3>

        {orcamentos.length === 0 ? (
          <p>Nenhum orçamento cadastrado.</p>
        ) : (
          orcamentos.map((orcamento) => (
            <div key={orcamento.id}>
              <h4>
                {orcamento.cliente} — {orcamento.pet}
              </h4>

              <p>Serviço: {orcamento.servico}</p>
              <p>Valor: {moeda(orcamento.valor)}</p>

              <label>
                Status:{" "}
                <select
                  value={orcamento.status}
                  onChange={(e) =>
                    alterarStatus(
                      orcamento.id,
                      e.target.value as Orcamento["status"]
                    )
                  }
                >
                  <option>Pendente</option>
                  <option>Aprovado</option>
                  <option>Recusado</option>
                </select>
              </label>

              <hr />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Orcamentos;
