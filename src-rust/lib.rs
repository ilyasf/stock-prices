use wasm_bindgen::prelude::*;
use web_sys::WebGlRenderingContext;

#[wasm_bindgen]
pub struct StockRenderer {
    context: WebGlRenderingContext,
}

#[wasm_bindgen]
impl StockRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Result<StockRenderer, JsValue> {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id(canvas_id).unwrap();
        let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into::<web_sys::HtmlCanvasElement>()?;
        let context = canvas
            .get_context("webgl")?
            .unwrap()
            .dyn_into::<WebGlRenderingContext>()?;

        Ok(StockRenderer { context })
    }

    pub fn render_graph(&self, prices: &[f32], width: u32, height: u32) {
        // Здесь будет логика рендеринга графика с использованием WebGL
        // Упрощенная версия для примера
    }
} 