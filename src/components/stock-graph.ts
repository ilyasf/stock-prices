import wasmInit, { StockRenderer } from '../pkg/stock_renderer.js';

class StockGraph extends HTMLElement implements StockGraphElement {
    private canvas: HTMLCanvasElement | null = null;
    private renderer: StockRenderer | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        console.log('StockGraph constructor called');
    }

    async connectedCallback() {
        console.log('StockGraph connected to DOM');
        this.render();
        // Ждем следующего кадра, чтобы DOM обновился
        await new Promise(resolve => requestAnimationFrame(resolve));
        await this.initRenderer();
    }

    private async initRenderer() {
        console.log('Initializing WebGL renderer');
        try {
            // Проверяем поддержку WebGL
            this.checkWebGLSupport();
            
            // Инициализируем WASM модуль
            await wasmInit();
            
            // Генерируем уникальный ID для компонента
            const componentId = `stock-graph-${Math.random().toString(36).substr(2, 9)}`;
            this.id = componentId;
            
            // Создаем рендерер, передавая ID компонента
            console.log('Creating WebGL renderer with component ID:', componentId);
            this.renderer = new StockRenderer(componentId);
            console.log('WebGL renderer initialized');

            // Устанавливаем размеры canvas
            if (this.canvas) {
                const rect = this.getBoundingClientRect();
                this.canvas.width = Math.max(rect.width || 800, 100);
                this.canvas.height = Math.max(rect.height || 400, 100);
                console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
            }
        } catch (error) {
            console.error('Failed to initialize WebGL renderer:', error);
            this.initCanvasRenderer();
        }
    }

    private initCanvasRenderer() {
        // Используем тот же canvas для fallback
        if (!this.canvas) {
            console.error('Canvas not found (fallback)');
            return;
        }

        const rect = this.getBoundingClientRect();
        console.log('Component rect (fallback):', rect);

        this.canvas.width = Math.max(rect.width || 800, 100);
        this.canvas.height = Math.max(rect.height || 400, 100);
        console.log('Canvas size (fallback):', this.canvas.width, 'x', this.canvas.height);
    }

    render() {
        if (!this.shadowRoot) return;
        console.log('StockGraph rendering');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 20px;
                    width: 100%;
                    min-width: 100px;
                    min-height: 100px;
                }
                canvas {
                    width: 100%;
                    height: 400px;
                    border: 1px solid #ddd;
                    background: white;
                }
            </style>
            <canvas></canvas>
        `;

        this.canvas = this.shadowRoot.querySelector('canvas');
    }

    disconnectedCallback() {
        // Очищаем ресурсы при удалении компонента
        if (this.renderer) {
            this.renderer.free();
        }
        if (this.canvas) {
            this.canvas.remove();
        }
    }

    updateData(prices: number[]) {
        console.log('StockGraph updateData called with:', prices);
        if (!this.canvas) return;

        if (this.renderer) {
            // Используем WebGL рендерер
            this.renderer.render_graph(new Float32Array(prices), this.canvas.width, this.canvas.height);
        } else {
            // Fallback на Canvas API
            this.renderWithCanvas(prices);
        }
    }

    private renderWithCanvas(prices: number[]) {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;

        // Очищаем canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (prices.length < 2) return;

        // Находим min и max для масштабирования
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;

        // Добавляем отступы
        const padding = 40;
        const graphWidth = this.canvas.width - padding * 2;
        const graphHeight = this.canvas.height - padding * 2;

        // Рисуем оси
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        
        // Ось Y
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, this.canvas.height - padding);
        
        // Ось X
        ctx.moveTo(padding, this.canvas.height - padding);
        ctx.lineTo(this.canvas.width - padding, this.canvas.height - padding);
        
        ctx.stroke();

        // Рисуем график
        ctx.beginPath();
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;

        prices.forEach((price, index) => {
            const x = padding + (index / (prices.length - 1)) * graphWidth;
            const y = padding + (1 - (price - min) / range) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Добавляем метки цен
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        
        const priceStep = range / 5;
        for (let i = 0; i <= 5; i++) {
            const price = min + (priceStep * i);
            const y = padding + (1 - (i / 5)) * graphHeight;
            ctx.fillText(price.toFixed(2), padding - 5, y + 4);
        }
    }

    private checkWebGLSupport() {
        const canvas = document.createElement('canvas');
        
        // Проверяем WebGL2
        const gl2 = canvas.getContext('webgl2');
        if (gl2) {
            console.log('WebGL2 supported:', {
                vendor: gl2.getParameter(gl2.VENDOR),
                renderer: gl2.getParameter(gl2.RENDERER),
                version: gl2.getParameter(gl2.VERSION),
                shadingLanguageVersion: gl2.getParameter(gl2.SHADING_LANGUAGE_VERSION)
            });
            return;
        }

        // Проверяем WebGL1
        const gl1 = canvas.getContext('webgl');
        if (gl1) {
            console.log('WebGL1 supported:', {
                vendor: gl1.getParameter(gl1.VENDOR),
                renderer: gl1.getParameter(gl1.RENDERER),
                version: gl1.getParameter(gl1.VERSION),
                shadingLanguageVersion: gl1.getParameter(gl1.SHADING_LANGUAGE_VERSION)
            });
            return;
        }

        console.error('WebGL not supported');
    }
}

// Регистрируем компонент
if (!customElements.get('stock-graph')) {
    customElements.define('stock-graph', StockGraph);
}

export { StockGraph }; 