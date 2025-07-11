// script.js - v5 com Custo, Bombadas e Gráfico de Análise
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos ---
    const lubricationForm = document.getElementById('lubricationForm');
    const calculateBtn = document.getElementById('calculate');
    const resetBtn = document.getElementById('reset');
    const printBtn = document.getElementById('printBtn');
    const resultsSection = document.getElementById('results');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const tooltips = document.querySelectorAll('.tooltip');
    
    // --- Elementos de Saúde e Gráfico ---
    const healthBar = document.getElementById('healthBar');
    const healthText = document.getElementById('healthText');
    const theoreticalBar = document.getElementById('theoreticalBar');
    const safetyBar = document.getElementById('safetyBar');
    const finalBar = document.getElementById('finalBar');

    function resetFields() {
        if (lubricationForm) lubricationForm.reset();
        if (resultsSection) resultsSection.classList.add('hidden');
    }
    
    // --- Validação de Inputs ---
    function validateInputs(data) {
        const requiredFields = ['d', 'D', 'B', 'n'];
        for (const field of requiredFields) {
            if (isNaN(data[field]) || data[field] <= 0) {
                alert(`Por favor, preencha o campo '${field}' com um valor numérico positivo.`);
                document.getElementById({d: 'boreDiameter', D: 'outerDiameter', B: 'width', n: 'rpm'}[field]).focus();
                return false;
            }
        }
        if (data.D <= data.d) {
            alert("O diâmetro externo (D) deve ser maior que o diâmetro do furo (d).");
            document.getElementById('outerDiameter').focus();
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
                // Novos campos
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
            const base_life_hours = Math.min(Math.pow(10, 6) / (2 * speed_factor) - 4 * dm, 87600);
            const greaseLifeHours = Math.max(0, base_life_hours * temp_factor);

            const load_factors = { 'normal': 1, 'heavy': 0.5, 'shock': 0.1 };
            const env_factors = { 'clean': 1, 'dusty': 0.5, 'humid': 0.2, 'chemical': 0.1 };
            const correction_factor = load_factors[data.loadCondition] * env_factors[data.environment] * data.vibrationFactor * data.moistureFactor * data.orientationFactor;
            
            const theoreticalInterval = Math.max(0, (1.4 * Math.pow(10, 7) / (dm * Math.sqrt(data.n)) - 4 * data.d) * k_bearing * correction_factor);
            const safetyInterval = greaseLifeHours * 0.5;

            let finalIntervalHours;
            let intervalNote = "";
            if (theoreticalInterval > 0 && theoreticalInterval <= safetyInterval) {
                finalIntervalHours = theoreticalInterval;
                intervalNote = "O intervalo foi calculado com base nas condições operacionais e fatores de correção.";
            } else {
                finalIntervalHours = Math.max(0, safetyInterval);
                intervalNote = `<strong>Atenção:</strong> O intervalo foi limitado a 50% da vida útil estimada da graxa (${Math.round(greaseLifeHours).toLocaleString('pt-BR')} horas) para garantir a segurança, pois a temperatura e outros fatores indicam que a vida da graxa é o fator limitante.`;
            }

            // --- 3. CÁLCULOS ADICIONAIS (Custo, Bombadas) ---
            const relubPumps = data.greasePumpVolume > 0 ? (relubAmountGrams / data.greasePumpVolume).toFixed(1) : 'N/A';
            const relubsPerYear = finalIntervalHours > 0 ? (8760 / finalIntervalHours) : 0;
            const annualGreaseCost = data.greasePrice > 0 ? relubsPerYear * (relubAmountGrams / 1000) * data.greasePrice : 0;
            const annualCostFormatted = `R$ ${annualGreaseCost.toFixed(2).replace('.', ',')}`;

            // --- 4. CÁLCULO SAÚDE, RECOMENDAÇÕES E NOTAS ---
            updateHealthBar(correction_factor, temp_factor);
            
            let recViscosity, recThickener, recNLGI, recAdditives;
            if (speed_factor < 100000) recViscosity = "ISO VG 220-460"; else if (speed_factor < 400000) recViscosity = "ISO VG 100-220"; else recViscosity = "ISO VG 32-100";
            if (data.environment === "humid" || data.moistureFactor < 1.0) recThickener = "Sulf. Cálcio, Cplx. Alumínio"; else if (data.T > 120) recThickener = "Poliureia, Cplx. Bário"; else recThickener = "Lítio, Cplx. Lítio";
            if (data.n < 300) recNLGI = "NLGI 1-2"; else recNLGI = "NLGI 2-3";
            if (data.loadCondition === "shock") recAdditives = "EP (Extrema Pressão)"; else if (data.environment === "humid") recAdditives = "Inibidores de Corrosão"; else recAdditives = "Padrão (Antioxidante)";
            
            let fullNotes = `${intervalNote} Para um rolamento ${bearing_type_factors[data.bearingType].name} operando a ${data.n} RPM, a viscosidade se baseia no fator n*dm de ${Math.round(speed_factor).toLocaleString('pt-BR')}.`;

            // --- 5. EXIBIÇÃO DOS RESULTADOS ---
            displayResults({
                ...data,
                initialFillGrams,
                relubAmountGrams,
                greaseLifeHours,
                finalIntervalHours,
                bearingMassKg: (Math.PI / 4) * (Math.pow(data.D, 2) - Math.pow(data.d, 2)) * data.B * 7.85 / 1000000,
                relubPumps,
                annualCostFormatted,
                recViscosity, recThickener, recNLGI, recAdditives,
                fullNotes
            });

            // Atualiza o gráfico de análise
            updateIntervalChart(theoreticalInterval, safetyInterval, finalIntervalHours);
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            alert(`Ocorreu um erro durante o cálculo: ${error.message}`);
        }
    }
    
    function displayResults(res) {
        const updateField = (id, value, unit = '') => document.getElementById(id).innerHTML = `${value} <small>${unit}</small>`;
        updateField('initialFill', res.initialFillGrams.toFixed(2), 'gramas');
        updateField('relubAmount', res.relubAmountGrams.toFixed(2), 'gramas');
        updateField('relubPumps', res.relubPumps, 'acionamentos');
        updateField('annualCost', res.annualCostFormatted.split(' ')[1], res.annualCostFormatted.split(' ')[0] + ' / ano');
        updateField('greaseLife', Math.round(res.greaseLifeHours).toLocaleString('pt-BR'), 'horas');
        updateField('relubIntervalHours', Math.round(res.finalIntervalHours).toLocaleString('pt-BR'), 'horas');
        updateField('relubIntervalWeeks', res.workingHours > 0 ? (res.finalIntervalHours / res.workingHours).toFixed(1) : '0', 'semanas');
        updateField('bearingMass', res.bearingMassKg.toFixed(3), 'kg');
        
        document.getElementById('recViscosity').textContent = res.recViscosity;
        document.getElementById('recThickener').textContent = res.recThickener;
        document.getElementById('recNLGI').textContent = res.recNLGI;
        document.getElementById('recAdditives').textContent = res.recAdditives;
        document.getElementById('notesText').innerHTML = res.fullNotes;
    }

    function updateHealthBar(correction_factor, temp_factor) {
        // A "saúde" é o quão perto estamos das condições ideais (onde todos os fatores são 1).
        // Fatores de temperatura abaixo de 70°C (temp_factor > 1) não aumentam a saúde acima de 100%.
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
        const maxVal = Math.max(theoretical, safety, final, 1); // Evita divisão por zero
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
