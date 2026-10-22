
import type { Prioridade } from "./Chamado";

export type StatusTarefa =
  | "Pendente"
  | "Em andamento"
  | "Concluída";

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  dataCriacao: string;
  chamadoId?: string;
  chamadoTitulo?: string;
}
