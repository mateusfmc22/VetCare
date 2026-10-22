
export type Prioridade = "Baixa" | "Média" | "Alta";

export type StatusChamado =
  | "Pendente"
  | "Em andamento"
  | "Concluído";

export interface Acompanhamento {
  id: string;
  texto: string;
  data: string;
}

export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  solicitante: string;
  prioridade: Prioridade;
  status: StatusChamado;
  data: string;
  acompanhamentos: Acompanhamento[];
}
