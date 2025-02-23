declare module "*/stock_renderer.js" {
    export default function init(): Promise<void>;
    
    export class StockRenderer {
        constructor(canvas_id: string);
        render_graph(prices: Float32Array, width: number, height: number): void;
        free(): void;
    }
} 