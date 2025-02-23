class StockApp {
    private stockTable: StockTableElement;
    private stockGraph: StockGraphElement;
    private stocks = [
        { symbol: 'NVDA', name: 'NVIDIA' },
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'AMZN', name: 'Amazon' }
    ];
    private stockData: Array<{ symbol: string; name: string; price: number; change: number }> = [];

    constructor() {
       
        console.log('StockApp constructor called');
        
        console.log('Creating stock-table element');
        this.stockTable = document.createElement('stock-table') as StockTableElement;
        console.log('Creating stock-graph element');
        this.stockGraph = document.createElement('stock-graph') as StockGraphElement;
        
        const appElement = document.getElementById('app');
        if (!appElement) {
            console.error('App element not found!');
            return;
        }

        // Добавляем обработчик выбора акции
        this.stockTable.addEventListener('stockSelected', ((event: CustomEvent) => {
            const symbol = event.detail.symbol;
            console.log('Stock selected:', symbol);
            const stockData = this.stockData.find(s => s.symbol === symbol);
            if (stockData) {
                // Создаем массив цен для выбранной акции
                const prices = [stockData.price];
                console.log('Updating graph with prices:', prices);
                this.updateGraph(prices);
            }
        }) as EventListener);

        console.log('Adding components to DOM');
        appElement.appendChild(this.stockGraph);
        appElement.appendChild(this.stockTable as unknown as Node);
        
        // Ждем инициализации компонентов
        Promise.all([
            customElements.whenDefined('stock-table'),
            customElements.whenDefined('stock-graph')
        ]).then(() => {
            console.log('Components initialized');
            this.initializeApp();
        });
        
    }

    private async updateGraph(prices: number[]) {
        if (!this.stockGraph) {
            console.error('StockGraph component not initialized');
            return;
        }

        // Даем компоненту время на инициализацию
        if (!this.stockGraph.updateData) {
            await customElements.whenDefined('stock-graph');
            // Ждем следующего кадра анимации
            await new Promise(resolve => requestAnimationFrame(resolve));
        }

        try {
            this.stockGraph.updateData(prices);
        } catch (error) {
            console.error('Failed to update graph:', error);
        }
    }

    async initializeApp() {
        try {
            console.log('Fetching initial data...');
            await this.fetchAndUpdateData();
            setInterval(() => this.fetchAndUpdateData(), 60000, this);
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    async fetchAndUpdateData() {
        try {
            const data = await this.fetchStockData();
            console.log('Updating UI with data:', data);
            this.updateUI(data);
        } catch (error) {
            console.error('Failed to fetch stock data:', error);
        }
    }

    async fetchStockData() {
        // Временные тестовые данные
        return this.stocks.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            price: Math.random() * 1000 + 100,
            change: (Math.random() * 10) - 5
        }));
    }

    updateUI(data: Array<{ symbol: string; name: string; price: number; change: number }>) {
        console.log('Updating UI with data:', data);
        this.stockData = data;

        if (!this.stockTable) {
            console.error('StockTable component not initialized');
            return;
        }
        
        const dataStr = JSON.stringify(data);
        console.log('Setting data attribute:', dataStr);
        this.stockTable.setAttribute('data', dataStr);
    }
}

// Добавляем обработку ошибок при инициализации
try {
    console.log('Starting application...');
    new StockApp();
} catch (error) {
    console.error('Failed to start application:', error);
} 