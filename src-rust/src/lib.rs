use wasm_bindgen::prelude::*;
use web_sys::{
    WebGlRenderingContext,
    WebGl2RenderingContext,
    Element,
    HtmlCanvasElement,
    ShadowRoot,
    Document,
    Window,
};

#[wasm_bindgen]
pub enum WebGLVersion {
    WebGL1,
    WebGL2
}

#[wasm_bindgen]
pub struct StockRenderer {
    gl1_context: Option<WebGlRenderingContext>,
    gl2_context: Option<WebGl2RenderingContext>,
    version: WebGLVersion,
}

#[wasm_bindgen]
impl StockRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(component_id: &str) -> Result<StockRenderer, JsValue> {
        // Получаем компонент
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let component = document
            .get_element_by_id(component_id)
            .ok_or_else(|| JsValue::from_str("Component not found"))?;

        // Получаем shadow root
        let shadow_root = component
            .shadow_root()
            .ok_or_else(|| JsValue::from_str("Shadow root not found"))?;

        // Находим canvas в shadow root
        let canvas = shadow_root
            .query_selector("canvas")
            .map_err(|_| JsValue::from_str("Failed to query canvas"))?
            .ok_or_else(|| JsValue::from_str("Canvas not found in shadow root"))?;

        // Приводим Element к HtmlCanvasElement
        let canvas: HtmlCanvasElement = canvas
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| JsValue::from_str("Element is not a canvas"))?;

        web_sys::console::log_1(&"Canvas found".into());
        let test = canvas.get_context("webgl2")?;
        web_sys::console::log_1(&format!("Test: {:?}", test).into());
        let test2 = canvas.get_context("webgl")?;
        web_sys::console::log_1(&format!("Test2: {:?}", test2).into());

        // Пробуем получить WebGL2 контекст
        if let Some(ctx) = canvas.get_context("webgl2")? {
            let gl2 = ctx.dyn_into::<WebGl2RenderingContext>()?;
            gl2.clear_color(0.0, 0.0, 0.0, 0.0);
            gl2.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);
            gl2.enable(WebGl2RenderingContext::BLEND);
            gl2.blend_func(
                WebGl2RenderingContext::SRC_ALPHA,
                WebGl2RenderingContext::ONE_MINUS_SRC_ALPHA,
            );
            Ok(StockRenderer { 
                gl1_context: None,
                gl2_context: Some(gl2),
                version: WebGLVersion::WebGL2 
            })
        } else if let Some(ctx) = canvas.get_context("webgl")? {
            let gl1 = ctx.dyn_into::<WebGlRenderingContext>()?;
            gl1.clear_color(0.0, 0.0, 0.0, 0.0);
            gl1.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);
            gl1.enable(WebGlRenderingContext::BLEND);
            gl1.blend_func(
                WebGlRenderingContext::SRC_ALPHA,
                WebGlRenderingContext::ONE_MINUS_SRC_ALPHA,
            );
            Ok(StockRenderer { 
                gl1_context: Some(gl1),
                gl2_context: None,
                version: WebGLVersion::WebGL1 
            })
        } else {
            Err(JsValue::from_str("Neither WebGL2 nor WebGL1 is supported"))
        }
    }

    pub fn render_graph(&self, prices: &[f32], width: u32, height: u32) {
        match self.version {
            WebGLVersion::WebGL2 => {
                if let Some(ref ctx) = self.gl2_context {
                    ctx.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);
                    ctx.viewport(0, 0, width as i32, height as i32);
                }
            },
            WebGLVersion::WebGL1 => {
                if let Some(ref ctx) = self.gl1_context {
                    ctx.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);
                    ctx.viewport(0, 0, width as i32, height as i32);
                }
            }
        }
        
        web_sys::console::log_1(&"Rendering graph...".into());
        web_sys::console::log_1(&format!("Prices: {:?}", prices).into());
        web_sys::console::log_1(&format!("Canvas size: {}x{}", width, height).into());
    }
} 