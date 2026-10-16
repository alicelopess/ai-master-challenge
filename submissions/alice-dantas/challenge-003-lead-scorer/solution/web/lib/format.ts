// Formatação para a tela: só apresenta valores que vieram da API, não calcula nenhum.

export const formatInt = (value: number): string => value.toLocaleString("pt-BR");

/** "2017-12-31" → "31/12/2017". */
export const formatDate = (iso: string): string => iso.split("-").reverse().join("/");

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
