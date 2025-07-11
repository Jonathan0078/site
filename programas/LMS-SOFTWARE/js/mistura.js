// js/mistura.js

document.addEventListener('DOMContentLoaded', () => {
    // [FIX] - Seletores corrigidos para corresponder ao HTML de mistura.html
    const visc1Input = document.getElementById('visc1');
    const vol1Input = document.getElementById('vol1');
    const visc2Input = document.getElementById('visc2');
    const vol2Display = document.getElementById('vol2-display'); // [NEW] Campo de display para o volume 2
    const calculateBlendButton = document.getElementById('calculate-blend-button');
    const blendResultDiv = document.getElementById('blend-result');
    const blendResultText = document.getElementById('blend-result-text');

    if (!visc1Input || !vol1Input || !visc2Input || !calculateBlendButton || !blendResultDiv || !blendResultText) {
        console.error('Erro: Um ou mais elementos do DOM não foram encontrados.');
        return;
    }

    // [IMPROVEMENT] - Atualiza o campo de volume 2 automaticamente
    vol1Input.addEventListener('input', () => {
        const vol1 = parseFloat(vol1Input.value);
        if (!isNaN(vol1) && vol1 >= 0 && vol1 <= 100) {
            vol2Display.value = (100 - vol1).toFixed(0) + ' %';
        } else {
            vol2Display.value = 'Calculado automaticamente';
        }
    });

    /**
     * Calcula a viscosidade da mistura usando a equação de Arrhenius.
     * v = Viscosidade Cinemática em centistokes (cSt)
     */
    function calculateBlendViscosity() {
        const v1 = parseFloat(visc1Input.value);
        const p1 = parseFloat(vol1Input.value) / 100; // Converte para decimal
        const v2 = parseFloat(visc2Input.value);
        const p2 = 1 - p1; // [IMPROVEMENT] Volume 2 é o restante

        if (isNaN(v1) || isNaN(p1) || isNaN(v2)) {
            alert('Por favor, preencha todos os campos com valores numéricos válidos.');
            return;
        }

        if (p1 < 0.01 || p1 > 0.99) {
            alert('A percentagem do Óleo 1 deve estar entre 1 e 99.');
            return;
        }

        // A equação de Arrhenius para mistura de viscosidades usa uma escala log-log.
        // log(log(v+0.8)) = p1 * log(log(v1+0.8)) + p2 * log(log(v2+0.8))
        // Onde 'v' é a viscosidade cinemática em cSt. A constante 0.8 é um fator de correção empírico.

        // Passo 1: Calcular os termos log-log para cada óleo
        const logLogV1 = Math.log(Math.log(v1 + 0.8));
        const logLogV2 = Math.log(Math.log(v2 + 0.8));

        // Passo 2: Calcular a média ponderada na escala log-log
        const weightedLogLog = (p1 * logLogV1) + (p2 * logLogV2);

        // Passo 3: Reverter o cálculo para obter a viscosidade da mistura
        const innerValue = Math.exp(weightedLogLog);
        const blendViscosity = Math.exp(innerValue) - 0.8;

        displayResult(blendViscosity);
    }

    function displayResult(viscosity) {
        if (isNaN(viscosity) || !isFinite(viscosity)) {
            blendResultText.textContent = 'Erro no cálculo.';
            blendResultDiv.classList.remove('hidden');
        } else {
            blendResultText.textContent = `~ ${viscosity.toFixed(2)} cSt`;
            blendResultDiv.classList.remove('hidden');
        }
    }

    // --- EVENT LISTENER ---
    calculateBlendButton.addEventListener('click', calculateBlendViscosity);
});
