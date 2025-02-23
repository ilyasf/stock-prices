declare namespace JSX {
    interface IntrinsicElements {
        'stock-table': any;
        'stock-graph': any;
    }
}

interface StockTableElement extends HTMLElement {
    updateData(data: Array<{
        symbol: string;
        name: string;
        price: number;
        change: number;
    }>): void;
    addEventListener(type: 'stockSelected', listener: (event: CustomEvent<{ symbol: string }>) => void): void;
}

interface StockGraphElement extends HTMLElement {
    updateData(prices: number[]): void;
}

declare global {
    interface HTMLElementTagNameMap {
        'stock-table': StockTableElement;
        'stock-graph': StockGraphElement;
    }
} 