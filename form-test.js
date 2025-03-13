// Form test scenarios
const testScenarios = [
    {
        name: 'Empty Form',
        data: {
            naam: '',
            email: '',
            telefoon: '',
            dienst: '',
            bericht: ''
        },
        expectedErrors: ['naam', 'email', 'telefoon', 'dienst', 'bericht']
    },
    {
        name: 'Invalid Email Formats',
        data: [
            { email: 'test' },
            { email: 'test@' },
            { email: 'test@domain' },
            { email: '@domain.com' },
            { email: 'test@.com' }
        ],
        expectedError: 'email'
    },
    {
        name: 'Invalid Dutch Phone Numbers',
        data: [
            { telefoon: '123456789' },      // Missing prefix
            { telefoon: '+311234567890' },  // Too long
            { telefoon: '0612345' },        // Too short
            { telefoon: '+32612345678' },   // Wrong country code
            { telefoon: 'abc1234567' }      // Non-numeric
        ],
        expectedError: 'telefoon'
    },
    {
        name: 'Valid Dutch Phone Numbers',
        data: [
            { telefoon: '0612345678' },
            { telefoon: '+31612345678' },
            { telefoon: '0201234567' },
            { telefoon: '+31201234567' }
        ],
        shouldPass: true
    },
    {
        name: 'Message Length Tests',
        data: [
            { bericht: 'Too short' },                    // Under 10 chars
            { bericht: 'a'.repeat(501) },                // Over 500 chars
            { bericht: 'Perfect length message' },       // Valid
            { bericht: 'a'.repeat(500) }                 // Edge case - max length
        ],
        expectedError: 'bericht'
    },
    {
        name: 'Valid Complete Form',
        data: {
            naam: 'John Doe',
            email: 'john@example.com',
            telefoon: '0612345678',
            dienst: 'auto',
            bericht: 'Dit is een testbericht voor de auto interieurreiniging service.'
        },
        shouldPass: true
    },
    {
        name: 'Special Characters',
        data: {
            naam: 'Jañ-Piętér O\'Neill',
            email: 'test+special@domain.com',
            telefoon: '+31 6-12345678',
            dienst: 'tapijt',
            bericht: 'Test met špéciałe karakters: ěščřžýáíé'
        },
        shouldPass: true
    },
    {
        name: 'XSS Prevention',
        data: {
            naam: '<script>alert("xss")</script>',
            email: '"><img src=x onerror=alert(1)>',
            bericht: '<img src=x onerror=alert("xss")>'
        },
        expectedErrors: ['naam', 'email']
    }
];

// Test runner
class FormTester {
    constructor() {
        this.form = document.querySelector('form[data-netlify="true"]');
        this.validator = new FormValidator(this.form);
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async runTests() {
        console.group('Starting Form Validation Tests');
        console.time('Tests Duration');

        for (const scenario of testScenarios) {
            await this.runScenario(scenario);
        }

        console.timeEnd('Tests Duration');
        console.log('Test Results:', this.results);
        console.groupEnd();
    }

    async runScenario(scenario) {
        console.group(`Test Scenario: ${scenario.name}`);
        this.results.total++;

        try {
            if (Array.isArray(scenario.data)) {
                // Multiple test cases for the same field
                for (const testCase of scenario.data) {
                    await this.testSingleCase(testCase, scenario);
                }
            } else {
                // Single complete form test
                await this.testSingleCase(scenario.data, scenario);
            }
            this.results.passed++;
            console.log('✅ Scenario passed');
        } catch (error) {
            this.results.failed++;
            console.error('❌ Scenario failed:', error);
        }

        console.groupEnd();
    }

    async testSingleCase(data, scenario) {
        // Reset form
        this.form.reset();
        this.validator.errors.clear();

        // Fill form with test data
        Object.entries(data).forEach(([field, value]) => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input) {
                input.value = value;
                // Trigger validation
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('blur'));
            }
        });

        // Validate expectations
        if (scenario.shouldPass) {
            if (this.validator.errors.size > 0) {
                throw new Error(`Expected form to pass but got errors: ${Array.from(this.validator.errors.entries())}`);
            }
        } else if (scenario.expectedErrors) {
            const hasExpectedErrors = scenario.expectedErrors.every(field => 
                this.validator.errors.has(field)
            );
            if (!hasExpectedErrors) {
                throw new Error(`Missing expected errors. Current errors: ${Array.from(this.validator.errors.entries())}`);
            }
        } else if (scenario.expectedError) {
            if (!this.validator.errors.has(scenario.expectedError)) {
                throw new Error(`Expected error for field '${scenario.expectedError}' not found`);
            }
        }

        // Log field states
        console.log('Field States:', {
            values: Object.fromEntries(
                Array.from(this.form.elements)
                    .filter(el => el.name)
                    .map(el => [el.name, el.value])
            ),
            errors: Object.fromEntries(this.validator.errors)
        });

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Run tests when page is ready
document.addEventListener('DOMContentLoaded', () => {
    const tester = new FormTester();
    tester.runTests().catch(console.error);
});
