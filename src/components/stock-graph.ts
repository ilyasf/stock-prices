import wasmInit, { StockRenderer } from '../pkg/stock_renderer.js';

class StockGraph extends HTMLElement implements StockGraphElement {
    private canvas: HTMLCanvasElement | null = null;
    private renderer: StockRenderer | null = null;
    private webGLMode: 'webgl1' | 'webgl2' | undefined;

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
            
            // Генерируем уникальный ID для компонента
            const componentId = `stock-graph-${Math.random().toString(36).substr(2, 9)}`;
            this.id = componentId;
            this.canvas?.setAttribute('id', `${componentId}`);
            
            // Создаем рендерер, передавая ID компонента
            console.log('Creating WebGL renderer with component ID:', componentId);
            
            // Устанавливаем размеры canvas
            if (this.canvas) {
                const rect = this.getBoundingClientRect();
                this.canvas.width = Math.max(rect.width || 800, 100);
                this.canvas.height = Math.max(rect.height || 400, 100);
                const ctx = this.canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = '#000';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
                }
                console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
                                
                await wasmInit();
                this.renderer = new StockRenderer(componentId);
                console.log('WebGL renderer initialized');
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
        `;        
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
            console.log('Calling render_graph with WebGL renderer ', this.canvas.width, this.canvas.height);
            this.renderer.render_graph(new Float32Array(prices), this.canvas.width, this.canvas.height);
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
            this.canvas = canvas;
            this.shadowRoot?.appendChild(canvas);
            this.webGLMode = 'webgl2';
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
            this.canvas = canvas;
            this.shadowRoot?.appendChild(canvas);  
            this.webGLMode = 'webgl1';          
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