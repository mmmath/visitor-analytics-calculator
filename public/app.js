// Global variables
let visitorInfo = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadVisitorInfo();
    updateServerTime();
    setInterval(updateServerTime, 1000);
    setupCalculatorTabs();
});

// ============================================
// VISITOR INFO & TIME
// ============================================

async function loadVisitorInfo() {
    try {
        const response = await fetch('/api/visitor-info');
        const data = await response.json();
        visitorInfo = data;
        
        displayVisitorInfo(data);
    } catch (error) {
        console.error('Error loading visitor info:', error);
    }
}

function displayVisitorInfo(data) {
    document.getElementById('ip-address').textContent = data.ip;
    document.getElementById('country').textContent = data.country;
    document.getElementById('city').textContent = data.city;
    document.getElementById('visitor-timezone').textContent = data.timezone;
    document.getElementById('coordinates').textContent = 
        data.latitude && data.longitude 
            ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
            : 'Not available';
}

async function updateServerTime() {
    try {
        const response = await fetch('/api/server-time');
        const data = await response.json();
        const serverTime = new Date(data.serverTime);
        
        // Get visitor's timezone from browser
        const visitorTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        document.getElementById('your-timezone').textContent = visitorTimezone;
        
        // Convert server time to visitor's timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: visitorTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const formattedTime = formatter.format(serverTime);
        document.getElementById('server-time').textContent = formattedTime;
    } catch (error) {
        console.error('Error updating time:', error);
    }
}

// ============================================
// CALCULATOR - BASIC
// ============================================

const calculator = {
    display: document.getElementById('calc-display'),
    input: '',
    previousValue: null,
    operation: null,
    shouldResetDisplay: false,

    appendNumber(num) {
        if (this.shouldResetDisplay) {
            this.input = '';
            this.shouldResetDisplay = false;
        }
        this.input += num;
        this.updateDisplay();
    },

    appendOperator(op) {
        if (this.input === '') return;
        
        if (this.previousValue !== null && this.operation) {
            this.calculate();
        }
        
        this.previousValue = parseFloat(this.input);
        this.operation = op;
        this.input = '';
        this.updateDisplay();
    },

    calculate() {
        if (this.operation === null || this.input === '') return;
        
        const current = parseFloat(this.input);
        let result;
        
        switch (this.operation) {
            case '+':
                result = this.previousValue + current;
                break;
            case '-':
                result = this.previousValue - current;
                break;
            case '*':
                result = this.previousValue * current;
                break;
            case '/':
                result = this.previousValue / current;
                break;
            default:
                return;
        }
        
        this.input = result.toString();
        this.updateDisplay();
        this.storeCalculation('basic', 
            { num1: this.previousValue, num2: current, operation: this.operation },
            result
        );
        
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = true;
    },

    clear() {
        this.input = '';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    },

    backspace() {
        this.input = this.input.slice(0, -1);
        this.updateDisplay();
    },

    updateDisplay() {
        this.display.value = this.input || '0';
    },

    storeCalculation(type, input, result) {
        fetch('/api/store-calculation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorIp: visitorInfo.ip,
                calculatorType: type,
                inputData: input,
                result: result
            })
        }).catch(err => console.error('Error storing calculation:', err));
    }
};

// ============================================
// CALCULATOR - SCIENTIFIC
// ============================================

const scientificCalc = {
    display: document.getElementById('sci-display'),
    input: '',
    previousValue: null,
    operation: null,
    shouldResetDisplay: false,

    appendNumber(num) {
        if (this.shouldResetDisplay) {
            this.input = '';
            this.shouldResetDisplay = false;
        }
        this.input += num;
        this.updateDisplay();
    },

    appendOperator(op) {
        if (this.input === '') return;
        
        if (this.previousValue !== null && this.operation) {
            this.calculate();
        }
        
        this.previousValue = parseFloat(this.input);
        this.operation = op;
        this.input = '';
    },

    function(func) {
        if (this.input === '' && func !== 'pow' && func !== 'pow3' && func !== 'factorial') return;
        
        const value = parseFloat(this.input) || 0;
        let result;
        
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180); // Convert to radians
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'pow':
                result = Math.pow(value, 2);
                break;
            case 'pow3':
                result = Math.pow(value, 3);
                break;
            case 'factorial':
                result = this.factorial(Math.floor(value));
                break;
            default:
                return;
        }
        
        this.input = result.toString();
        this.updateDisplay();
        this.storeCalculation('scientific', { value, function: func }, result);
        this.shouldResetDisplay = true;
    },

    factorial(n) {
        if (n < 0) return 'Error';
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    },

    calculate() {
        if (this.operation === null || this.input === '') return;
        
        const current = parseFloat(this.input);
        let result;
        
        switch (this.operation) {
            case '+':
                result = this.previousValue + current;
                break;
            case '-':
                result = this.previousValue - current;
                break;
            case '*':
                result = this.previousValue * current;
                break;
            case '/':
                result = this.previousValue / current;
                break;
            default:
                return;
        }
        
        this.input = result.toString();
        this.updateDisplay();
        this.storeCalculation('scientific', 
            { num1: this.previousValue, num2: current, operation: this.operation },
            result
        );
        
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = true;
    },

    clear() {
        this.input = '';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    },

    backspace() {
        this.input = this.input.slice(0, -1);
        this.updateDisplay();
    },

    updateDisplay() {
        this.display.value = this.input || '0';
    },

    storeCalculation(type, input, result) {
        fetch('/api/store-calculation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorIp: visitorInfo.ip,
                calculatorType: type,
                inputData: input,
                result: result
            })
        }).catch(err => console.error('Error storing calculation:', err));
    }
};

// ============================================
// CALCULATOR - MORTGAGE
// ============================================

const mortgageCalc = {
    calculate() {
        const principal = parseFloat(document.getElementById('mortgage-principal').value);
        const rate = parseFloat(document.getElementById('mortgage-rate').value);
        const years = parseFloat(document.getElementById('mortgage-years').value);
        
        if (!principal || !rate || !years) {
            document.getElementById('mortgage-result').innerHTML = 
                '<span style="color: #e74c3c;">Please fill all fields</span>';
            return;
        }
        
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;
        
        const monthlyPayment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        
        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - principal;
        
        document.getElementById('mortgage-result').innerHTML = `
            <div style="text-align: left;">
                <div style="margin: 8px 0;"><strong>Monthly Payment:</strong> $${monthlyPayment.toFixed(2)}</div>
                <div style="margin: 8px 0;"><strong>Total Payment:</strong> $${totalPayment.toFixed(2)}</div>
                <div style="margin: 8px 0;"><strong>Total Interest:</strong> $${totalInterest.toFixed(2)}</div>
            </div>
        `;
        
        this.storeCalculation('mortgage',
            { principal, rate, years },
            { monthlyPayment, totalPayment, totalInterest }
        );
    },

    storeCalculation(type, input, result) {
        fetch('/api/store-calculation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorIp: visitorInfo.ip,
                calculatorType: type,
                inputData: input,
                result: result
            })
        }).catch(err => console.error('Error storing calculation:', err));
    }
};

// ============================================
// CALCULATOR - RADIANT
// ============================================

const radiantCalc = {
    calculateArea() {
        const radius = parseFloat(document.getElementById('radius').value);
        
        if (!radius || radius < 0) {
            document.getElementById('circle-area-result').innerHTML = 
                '<span style="color: #e74c3c;">Please enter valid radius</span>';
            return;
        }
        
        const area = Math.PI * Math.pow(radius, 2);
        const circumference = 2 * Math.PI * radius;
        
        document.getElementById('circle-area-result').innerHTML = `
            <div style="text-align: left;">
                <div style="margin: 8px 0;"><strong>Area:</strong> ${area.toFixed(4)} sq units</div>
                <div style="margin: 8px 0;"><strong>Circumference:</strong> ${circumference.toFixed(4)} units</div>
            </div>
        `;
        
        this.storeCalculation('radiant',
            { radius, type: 'circle' },
            { area, circumference }
        );
    },

    calculatePerimeter() {
        const side = parseFloat(document.getElementById('side-length').value);
        
        if (!side || side < 0) {
            document.getElementById('perimeter-result').innerHTML = 
                '<span style="color: #e74c3c;">Please enter valid side length</span>';
            return;
        }
        
        const perimeter = 4 * side;
        const area = Math.pow(side, 2);
        const diagonal = side * Math.sqrt(2);
        
        document.getElementById('perimeter-result').innerHTML = `
            <div style="text-align: left;">
                <div style="margin: 8px 0;"><strong>Perimeter:</strong> ${perimeter.toFixed(4)} units</div>
                <div style="margin: 8px 0;"><strong>Area:</strong> ${area.toFixed(4)} sq units</div>
                <div style="margin: 8px 0;"><strong>Diagonal:</strong> ${diagonal.toFixed(4)} units</div>
            </div>
        `;
        
        this.storeCalculation('radiant',
            { side, type: 'square' },
            { perimeter, area, diagonal }
        );
    },

    storeCalculation(type, input, result) {
        fetch('/api/store-calculation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                visitorIp: visitorInfo.ip,
                calculatorType: type,
                inputData: input,
                result: result
            })
        }).catch(err => console.error('Error storing calculation:', err));
    }
};

// ============================================
// CALCULATOR TABS
// ============================================

function setupCalculatorTabs() {
    const buttons = document.querySelectorAll('.calc-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Hide all calculators
            document.querySelectorAll('.calc-container').forEach(calc => {
                calc.classList.add('hidden');
            });
            
            // Show selected calculator
            const calcType = e.target.dataset.type;
            document.getElementById(`${calcType}-calc`).classList.remove('hidden');
        });
    });
}
