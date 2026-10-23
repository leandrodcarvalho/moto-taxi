export type Papel = "cliente" | "admin" | "motorista";

export type StatusCorrida =
  | "solicitada"
  | "atribuida"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export type Perfil = {
  id: string;
  empresa_id: string;
  papel: Papel;
  nome_completo: string;
  telefone: string | null;
  email: string | null;
};

export type Motorista = {
  perfil_id: string;
  marca: string;
  modelo: string;
  cor: string;
  placa: string;
  ativo: boolean;
};

export type Corrida = {
  id: string;
  empresa_id: string;
  cliente_id: string;
  motorista_id: string | null;
  origem_endereco: string;
  destino_endereco: string;
  distancia_km: number;
  duracao_min: number | null;
  valor_estimado: number;
  status: StatusCorrida;
  solicitada_em: string;
  atribuida_em: string | null;
  iniciada_em: string | null;
  concluida_em: string | null;
};

export const ROTULO_STATUS: Record<StatusCorrida, string> = {
  solicitada: "Aguardando motorista",
  atribuida: "Motorista a caminho",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
