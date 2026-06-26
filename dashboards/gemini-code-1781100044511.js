// Constantes protegidas no servidor
const CONFIG = {
  ORIGINAL: 18852.48,
  SERIES: {
    "IPCA": [9473.37, 9895.88, 10479.74, 10931.42, 11577.46, 12330.0, 13050.07, 13821.33, 14707.28, 16276.54, 17300.34, 17810.7, 18478.6, 19275.03, 20146.26, 22172.97, 23456.79, 24540.49, 25725.8, 27135.57, 27895.37],
    // ... adicione as outras séries aqui (INPC, IGP-M, etc.)
  },
  INDICES: {
    "IPCA": { fator: 2.959331, proreata: 0.0035 },
    // ... adicione os fatores aqui
  }
};

// Função chamada pelo frontend para obter o cálculo
function calcularMeacaoBackend(idx, mes, ano) {
  const fator = calcularFator(idx, mes, ano);
  const total = CONFIG.ORIGINAL * fator;
  
  return {
    totalAtualizado: total,
    meacao: total / 2,
    fator: fator
  };
}

function calcularFator(idx, mes, ano) {
  // Lógica matemática complexa rodando exclusivamente no servidor
  const mAlvo = (ano - 2006) * 12 + mes - 10;
  // ... (implementação da sua fórmula de interpolação aqui)
  return 2.95; // Exemplo de retorno
}