// script.js - v5.2 Final Corrigido
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos ---
    const lubricationForm = document.getElementById('lubricationForm');
    const calculateBtn = document.getElementById('calculate');
    const resetBtn = document.getElementById('reset');
    const printBtn = document.getElementById('printBtn');
    const resultsSection = document.getElementById('results');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const tooltips = document.querySelectorAll('.tooltip');
    
    const healthBar = document.getElementById('healthBar');
    const healthText = document.getElementById('healthText');
    const theoreticalBar = document.getElementById('theoreticalBar');
    const safetyBar = document.getElementById('safetyBar');
    const finalBar = document.getElementById('finalBar');

    function resetFields() {
        if (lubricationForm) lubricationForm.reset();
        if (resultsSection) resultsSection.classList.add('hidden');
    }
    
    function validateInputs(data) {
        const requiredFields = {
            'd': 'boreDiameter', 'D': 'outerDiameter', 'B': 'width', 'n': 'rpm'
        };
        for (const field in requiredFields) {
            if (isNaN(data[field]) || data[field] <= 0) {
                alert(`Por favor, preencha o campo '${field.toUpperCase()}' com um valor numérico positivo.`);
                document.getElementById(requiredFields[field]).focus();
                return false;
            }
        }
        if (data.D <= data.d) {
            alert("O diâmetro externo (D) deve ser maior que o diâmetro do furo (d).");
            document.getElementById('outerDiameter').focus();
            return false;
        }
        if (isNaN(data.greaseDensity) || data.greaseDensity <= 0) {
            alert("A densidade da graxa deve ser um valor positivo.");
            document.getElementById('greaseDensity').focus();
            return false;
        }
        return true;
    }

    function calculateLubrication() {
        try {
            // --- 1. COLETA DE DADOS ---
            const data = {
                bearingType: document.getElementById('bearingType').value,
                d: parseFloat(document.getElementById('boreDiameter').value),
                D: parseFloat(document.getElementById('outerDiameter').value),
                B: parseFloat(document.getElementById('width').value),
                n: parseFloat(document.getElementById('rpm').value),
                T: parseFloat(document.getElementById('temperature').value),
                lubeApplication: document.getElementById('lubeApplication').value,
                workingHours: parseFloat(document.getElementById('workingHours').value),
                greaseDensity: parseFloat(document.getElementById('greaseDensity').value),
                loadCondition: document.getElementById('loadCondition').value,
                environment: document.getElementById('environment').value,
                vibrationFactor: parseFloat(document.getElementById('vibration').value),
                moistureFactor: parseFloat(document.getElementById('moisture').value),
                orientationFactor: parseFloat(document.getElementById('orientation').value),
                greasePumpVolume: parseFloat(document.getElementById('greasePumpVolume').value),
                greasePrice: parseFloat(document.getElementById('greasePrice').value)
            };

            if (!validateInputs(data)) return;

            // --- 2. LÓGICA DE CÁLCULO ---
            const dm = 0.5 * (data.d + data.D);
            const speed_factor = data.n * dm;

            const bearing_type_factors = { 'ball': { k: 1, name: 'Rígido de Esferas' }, 'angular': { k: 1, name: 'Contato Angular' }, 'sphericalRoller': { k: 5, name: 'Autocompensador de Rolos' }, 'taperedRoller': { k: 5, name: 'Rolos Cônicos' }, 'cylindricalRoller': { k: 2, name: 'Rolos Cilíndricos' } };
            const k_bearing = bearing_type_factors[data.bearingType]?.k || 1;

            const lube_k = data.lubeApplication === 'center' ? 0.002 : 0.005;
            const relubAmountGrams = lube_k * data.D * data.B;
            const initialFillGrams = relubAmountGrams * 3;

            const temp_factor = Math.pow(2, (70 - data.T) / 15);
            const base_life_hours = Math.max(0, Math.min(Math.pow(10, 6) / (2 * speed_factor) - 4 * dm, 87600));
            const greaseLifeHours = base_life_hours * temp_factor;

            const load_factors = { 'normal': 1, 'heavy': 0.5, 'shock': 0.1 };
            const env_factors = { 'clean': 1, 'dusty': 0.5, 'humid': 0.2, 'chemical': 0.1 };
            const correction_factor = load_factors[data.loadCondition] * env_factors[data.environment] * data.vibrationFactor * data.moistureFactor * data.orientationFactor;
            
            const theoreticalInterval = Math.max(0, (1.4 * Math.pow(10, 7) / (dm * Math.sqrt(data.n)) - 4 * data.d) * k_bearing * correction_factor);
            const safetyInterval = greaseLifeHours * 0.5;

            let finalIntervalHours;
            let intervalNote = "";
            if (theoreticalInterval > 0 && theoreticalInterval <= safetyInterval) {
                finalIntervalHours = theoreticalInterval;
                intervalNote = "O intervalo foi definido pela fórmula teórica, ajustada pelos fatores de correção.";
            } else {
                finalIntervalHours = safetyInterval;
                intervalNote = `<strong>Atenção:</strong> O intervalo foi limitado a 50% da vida útil da graxa (${Math.round(greaseLifeHours).toLocaleString('pt-BR')} h). Isso ocorre quando a vida da graxa é mais crítica que o intervalo teórico, geralmente sob alta temperatura ou contaminação severa.`;
            }

            // --- 3. RECOMENDAÇÕES E NOTAS ADICIONAIS ---
            updateHealthBar(correction_factor, temp_factor);
            
            let recViscosity, recThickener, recNLGI, recAdditives;
            if (speed_factor < 100000) recViscosity = "ISO VG 220-460"; else if (speed_factor < 400000) recViscosity = "ISO VG 100-220"; else recViscosity = "ISO VG 32-100";
            if (data.environment === "humid" || data.moistureFactor < 1.0) recThickener = "Sulf. Cálcio, Cplx. Alumínio"; else if (data.T > 120) recThickener = "Poliureia, Cplx. Bário"; else recThickener = "Lítio, Cplx. Lítio";
            if (data.n < 300) recNLGI = "NLGI 1-2"; else recNLGI = "NLGI 2-3";
            if (data.loadCondition === "shock") recAdditives = "EP (Extrema Pressão)"; else if (data.environment === "humid") recAdditives = "Inibidores de Corrosão"; else recAdditives = "Padrão (Antioxidante)";
            
            let fullNotes = `${intervalNote} Para um rolamento ${bearing_type_factors[data.bearingType].name} operando a ${data.n} RPM, a viscosidade se baseia no fator n*dm de ${Math.round(speed_factor).toLocaleString('pt-BR')}.`;

            if (finalIntervalHours <= 0) {
                 fullNotes += `<br><br><strong>AVISO CRÍTICO:</strong> O intervalo de relubrificação é zero. As condições de operação (alta velocidade/temperatura) excedem os limites deste modelo de cálculo. É necessária uma análise de engenharia. Considere um sistema de lubrificação a óleo ou consulte o fabricante do rolamento.`;
            }

            // --- 4. EXIBIÇÃO DOS RESULTADOS ---
            displayResults({
                ...data, initialFillGrams, relubAmountGrams, greaseLifeHours, finalIntervalHours,
                bearingMassKg: (Math.PI / 4) * (Math.pow(data.D, 2) - Math.pow(data.d, 2)) * data.B * 7.85 / 1000000,
                recViscosity, recThickener, recNLGI, recAdditives, fullNotes
            });

            updateIntervalChart(theoreticalInterval, safetyInterval, finalIntervalHours);
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            alert(`Ocorreu um erro durante o cálculo: ${error.message}`);
        }
    }
    
    function displayResults(res) {
        // Função auxiliar para atualizar qualquer cartão de resultado de forma padronizada
        const updateResultCard = (id, value, unit) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `${value} <small>${unit}</small>`;
            } else {
                console.warn(`Elemento com ID '${id}' não encontrado.`);
            }
        };

        // --- Atualiza todos os cartões de resultado ---
        updateResultCard('initialFill', res.initialFillGrams.toFixed(2), 'gramas');
        updateResultCard('relubAmount', res.relubAmountGrams.toFixed(2), 'gramas');
        updateResultCard('relubPumps', res.greasePumpVolume > 0 ? (res.relubAmountGrams / res.greasePumpVolume).toFixed(1) : 'N/A', 'acionamentos');
        updateResultCard('greaseLife', Math.round(res.greaseLifeHours).toLocaleString('pt-BR'), 'horas');
        updateResultCard('relubIntervalHours', Math.round(res.finalIntervalHours).toLocaleString('pt-BR'), 'horas');
        updateResultCard('relubIntervalWeeks', res.workingHours > 0 && res.finalIntervalHours > 0 ? (res.finalIntervalHours / res.workingHours).toFixed(1) : '0.0', 'semanas');
        updateResultCard('bearingMass', res.bearingMassKg.toFixed(3), 'kg');

        // Lógica especial para o Custo Anual
        if (res.finalIntervalHours > 0) {
            const relubsPerYear = 8760 / res.finalIntervalHours;
            const annualGreaseCost = res.greasePrice > 0 ? relubsPerYear * (res.relubAmountGrams / 1000) * res.greasePrice : 0;
            updateResultCard('annualCost', `R$ ${annualGreaseCost.toFixed(2).replace('.', ',')}`, 'por ano');
        } else {
            updateResultCard('annualCost', 'Incalculável', 'Condição Extrema');
        }
        
        // --- Atualiza recomendações e notas ---
        document.getElementById('recViscosity').textContent = res.recViscosity;
        document.getElementById('recThickener').textContent = res.recThickener;
        document.getElementById('recNLGI').textContent = res.recNLGI;
        document.getElementById('recAdditives').textContent = res.recAdditives;
        document.getElementById('notesText').innerHTML = res.fullNotes;
    }
    
    function updateHealthBar(correction_factor, temp_factor) {
        const healthScore = correction_factor * Math.min(1, temp_factor) * 100;
        const percentage = Math.max(0, Math.min(100, healthScore));
        healthBar.style.width = `${percentage}%`;
        healthBar.textContent = `${Math.round(percentage)}%`;
        healthBar.classList.remove('good', 'warning', 'danger');
        if (percentage > 75) {
            healthBar.classList.add('good');
            healthText.textContent = "Condições ideais. A graxa terá a máxima vida útil possível.";
        } else if (percentage > 40) {
            healthBar.classList.add('warning');
            healthText.textContent = "Condições moderadas. Fatores como carga e contaminação estão reduzindo a vida útil da graxa.";
        } else {
            healthBar.classList.add('danger');
            healthText.textContent = "Condições severas! A vida da graxa é drasticamente reduzida. Reavalie a lubrificação e o ambiente.";
        }
    }
    
    function updateIntervalChart(theoretical, safety, final) {
        const maxVal = Math.max(theoretical, safety, final, 1);
        const theoreticalPercent = (theoretical / maxVal) * 100;
        const safetyPercent = (safety / maxVal) * 100;
        const finalPercent = (final / maxVal) * 100;
        theoreticalBar.style.width = `${theoreticalPercent}%`;
        theoreticalBar.querySelector('span').textContent = `${Math.round(theoretical).toLocaleString('pt-BR')}h`;
        safetyBar.style.width = `${safetyPercent}%`;
        safetyBar.querySelector('span').textContent = `${Math.round(safety).toLocaleString('pt-BR')}h`;
        finalBar.style.width = `${finalPercent}%`;
        finalBar.querySelector('span').textContent = `${Math.round(final).toLocaleString('pt-BR')}h`;
    }

    // --- Event Listeners ---
    if (calculateBtn) calculateBtn.addEventListener('click', calculateLubrication);
    if (resetBtn) resetBtn.addEventListener('click', resetFields);
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    
    if (tooltips) {
        tooltips.forEach(tooltip => {
            tooltip.addEventListener('click', (event) => {
                event.stopPropagation();
                const isActive = tooltip.classList.contains('active');
                document.querySelectorAll('.tooltip.active').forEach(t => t.classList.remove('active'));
                if (!isActive) tooltip.classList.add('active');
            });
        });
        document.addEventListener('click', () => tooltips.forEach(t => t.classList.remove('active')));
    }

    window.addEventListener('scroll', () => {
        if (scrollTopBtn) scrollTopBtn.classList.toggle('hidden', window.scrollY <= 200);
    });
    if (scrollTopBtn) scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
