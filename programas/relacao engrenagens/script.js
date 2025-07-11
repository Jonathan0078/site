document.addEventListener('DOMContentLoaded', () => {
    // 1. ELEMENT SELECTION
    // Inputs
    const dentesZ1Input = document.getElementById('dentes-z1');
    const dentesZ2Input = document.getElementById('dentes-z2');
    const rpmEntradaInput = document.getElementById('rpm-entrada');
    const torqueEntradaInput = document.getElementById('torque-entrada');
    const eficienciaInput = document.getElementById('eficiencia');
    const allInputs = [dentesZ1Input, dentesZ2Input, rpmEntradaInput, torqueEntradaInput, eficienciaInput];

    // Buttons
    const calcularBtn = document.getElementById('calcular-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Animation Elements
    const gear1 = document.getElementById('gear1');
    const gear2 = document.getElementById('gear2');
    const gear1RotationIndicator = document.getElementById('gear1-rotation');
    const gear2RotationIndicator = document.getElementById('gear2-rotation');
    
    // Result Display
    const resultadoContainer = document.getElementById('resultado-container');
    const resultadoTipo = document.getElementById('resultado-tipo');
    const resultadoRelacao = document.getElementById('resultado-relacao');
    const resultadoRpm = document.getElementById('resultado-rpm');
    const resultadoTorque = document.getElementById('resultado-torque');
    
    // Error Display
    const erroContainer = document.getElementById('erro-container');

    // 2. FUNCTIONS
    /**
     * Validates the essential inputs (number of teeth) and enables/disables the calculate button.
     */
    const validateInputs = () => {
        const z1 = parseInt(dentesZ1Input.value, 10);
        const z2 = parseInt(dentesZ2Input.value, 10);

        // Enable button only if both teeth inputs are positive numbers
        if (z1 > 0 && z2 > 0) {
            calcularBtn.disabled = false;
            erroContainer.classList.add('hidden');
        } else {
            calcularBtn.disabled = true;
        }
    };

    /**
     * Stops any running animations on the gears.
     */
    const stopAnimation = () => {
        gear1.style.animation = 'none';
        gear2.style.animation = 'none';
    };

    /**
     * Resets the entire calculator to its initial state.
     */
    const handleReset = () => {
        // Clear essential input fields
        dentesZ1Input.value = '';
        dentesZ2Input.value = '';
        
        // Restore default values for other fields
        rpmEntradaInput.value = '1200';
        torqueEntradaInput.value = '10';
        eficienciaInput.value = '95';

        // Hide result and error containers
        resultadoContainer.classList.add('hidden');
        erroContainer.classList.add('hidden');
        
        // Stop animations
        stopAnimation();

        // Reset rotation indicators
        gear1RotationIndicator.textContent = 'Rotação: --';
        gear2RotationIndicator.textContent = 'Rotação: --';

        // Validate inputs to disable the button
        validateInputs();
    };

    /**
     * Reads inputs, performs calculations, updates the UI with results, and starts the animation.
     */
    const handleCalculateAndAnimate = () => {
        // Stop any previous animation
        stopAnimation();

        // 1. Get and parse input values
        const z1 = parseInt(dentesZ1Input.value, 10);
        const z2 = parseInt(dentesZ2Input.value, 10);
        const rpmEntrada = parseFloat(rpmEntradaInput.value) || 0;
        const torqueEntrada = parseFloat(torqueEntradaInput.value) || 0;
        const eficiencia = (parseFloat(eficienciaInput.value) || 100) / 100;

        // 2. Validate inputs
        if (z1 <= 0 || z2 <= 0) {
            erroContainer.classList.remove('hidden');
            resultadoContainer.classList.add('hidden');
            return;
        }
        erroContainer.classList.add('hidden');

        // 3. Perform calculations
        const relacao = z2 / z1;
        const rpmSaida = rpmEntrada / relacao;
        const torqueSaida = torqueEntrada * relacao * eficiencia;

        let tipoTransmissao = "1:1";
        if (relacao > 1) {
            tipoTransmissao = "Redutor";
        } else if (relacao < 1) {
            tipoTransmissao = "Multiplicador";
        }

        // 4. Update result display
        resultadoTipo.textContent = tipoTransmissao;
        resultadoRelacao.textContent = relacao.toFixed(2);
        resultadoRpm.textContent = rpmSaida.toFixed(2);
        resultadoTorque.textContent = torqueSaida.toFixed(2);
        resultadoContainer.classList.remove('hidden');

        // 5. Update rotation indicators
        gear1RotationIndicator.textContent = `Rotação: ${rpmEntrada.toFixed(0)} RPM`;
        gear2RotationIndicator.textContent = `Rotação: ${rpmSaida.toFixed(2)} RPM`;

        // 6. Set and start animations
        // Only animate if RPM > 0
        if (rpmEntrada > 0) {
            const duration1 = 60 / rpmEntrada;
            gear1.style.animation = `rotate-cw ${duration1}s linear infinite`;
        }
        if (rpmSaida > 0) {
            const duration2 = 60 / rpmSaida;
            gear2.style.animation = `rotate-ccw ${duration2}s linear infinite`;
        }
    };

    // 3. EVENT LISTENERS
    calcularBtn.addEventListener('click', handleCalculateAndAnimate);
    resetBtn.addEventListener('click', handleReset);
    
    // Add input event listeners to the essential fields for real-time validation
    dentesZ1Input.addEventListener('input', validateInputs);
    dentesZ2Input.addEventListener('input', validateInputs);

    // 4. INITIALIZATION
    handleReset(); // Set the initial state of the page
});