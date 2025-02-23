class StockTable extends HTMLElement implements StockTableElement {
    private selectedSymbol: string | null = null;

    static get observedAttributes() {
        return ['data'];
    }

    constructor() {
        super();
        console.log('StockTable constructor called');
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        console.log('StockTable connected to DOM');
        this.render();
    }

    disconnectedCallback() {
        console.log('StockTable removed from DOM');
    }

    adoptedCallback() {
        console.log('StockTable moved to new document');
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        console.log(`StockTable attribute ${name} changed from ${oldValue} to ${newValue}`);
        if (name === 'data' && newValue) {
            try {
                const data = JSON.parse(newValue);
                this.updateData(data);
            } catch (error) {
                console.error('Failed to parse data attribute:', error);
            }
        }
    }

    render() {
        if (!this.shadowRoot) return;
        console.log('StockTable rendering');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 8px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background-color: #f4f4f4;
                }
                tr {
                    cursor: pointer;
                }
                tr:hover {
                    background-color: #f8f8f8;
                }
                tr.selected {
                    background-color: #e3f2fd;
                }
            </style>
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Company</th>
                        <th>Price</th>
                        <th>Change</th>
                    </tr>
                </thead>
                <tbody id="stockRows"></tbody>
            </table>
        `;

        // Добавляем обработчик кликов
        const tbody = this.shadowRoot.querySelector('#stockRows');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const row = (e.target as HTMLElement).closest('tr');
                if (row) {
                    const symbol = row.getAttribute('data-symbol');
                    if (symbol) {
                        this.selectStock(symbol);
                    }
                }
            });
        }
    }

    private formatPrice(price: number): string {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    private formatChange(change: number): string {
        const formatted = new Intl.NumberFormat('ru-RU', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            signDisplay: 'always'
        }).format(change / 100);
        return formatted;
    }

    private selectStock(symbol: string) {
        console.log('Selected stock:', symbol);
        if (this.selectedSymbol === symbol) {
            return; // Избегаем повторного выбора той же акции
        }

        this.selectedSymbol = symbol;
        
        // Обновляем выделение в таблице
        const tbody = this.shadowRoot?.querySelector('#stockRows');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(row => {
                if (row.getAttribute('data-symbol') === symbol) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
            });
        }

        // Отправляем событие о выборе акции
        this.dispatchEvent(new CustomEvent('stockSelected', {
            detail: { symbol },
            bubbles: true,
            composed: true
        }));
    }

    updateData(data: any[]) {
        console.log('StockTable updateData called with:', data);
        const tbody = this.shadowRoot?.querySelector('#stockRows');
        if (!tbody) {
            console.error('Could not find tbody element');
            return;
        }

        tbody.innerHTML = data.map(stock => `
            <tr data-symbol="${stock.symbol}" class="${this.selectedSymbol === stock.symbol ? 'selected' : ''}">
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td>${this.formatPrice(stock.price)}</td>
                <td style="color: ${stock.change > 0 ? 'green' : 'red'}">
                    ${this.formatChange(stock.change)}
                </td>
            </tr>
        `).join('');

        // Если нет выбранной акции или её нет в новых данных, выбираем первую
        if (!this.selectedSymbol || !data.find(s => s.symbol === this.selectedSymbol)) {
            const firstStock = data[0];
            if (firstStock) {
                // Используем setTimeout, чтобы дать DOM обновиться
                setTimeout(() => this.selectStock(firstStock.symbol), 0);
            }
        }
    }
}

console.log('Defining StockTable component');
if (!customElements.get('stock-table')) {
    customElements.define('stock-table', StockTable);
    console.log('StockTable component registered');
}

export { StockTable }; 