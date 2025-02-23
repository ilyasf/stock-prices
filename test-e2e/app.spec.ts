import { test, expect } from '@playwright/test';
import { _electron as electron } from '@playwright/test';

test('приложение запускается и отображает приветственное сообщение', async () => {
  // Запускаем приложение
  const app = await electron.launch({
    args: ['.']
  });

  // Получаем главное окно
  const window = await app.firstWindow();
  
  // Проверяем, что окно видимо
  await expect(window).toBeTruthy();

  // Проверяем содержимое
  const content = await window.locator('#app').textContent();
  expect(content).toBe('Привет из Electron!');

  // Закрываем приложение
  await app.close();
});

test('размер окна соответствует ожидаемому', async () => {
  const app = await electron.launch({
    args: ['.']
  });

  const window = await app.firstWindow();
  
  // Исправляем проверку размеров окна
  const size = await window.evaluate(() => {
    const win = window as any;
    return {
      width: win.innerWidth,
      height: win.innerHeight
    };
  });

  expect(size.width).toBe(800);
  expect(size.height).toBe(600);

  await app.close();
}); 