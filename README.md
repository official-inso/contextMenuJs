# Пример использования ContextMenu

Это пример того, как использовать библиотеку ContextMenu в вашем проекте.

## Использование

1. Импортируйте библиотеку ContextMenu:
   ```javascript
   const ContextMenu = (await import("/lib/contextmenu/script.js")).default;

2. Инициализируйте ContextMenu с вашей конфигурацией:
   ```javascript
   if (ContextMenu) {
      ContextMenu.init({
        style: "/lib/contextmenu/style.css",
        template: "/lib/contextmenu/template.html",
        selector: 'body'
      });
   }

3. Добавьте контекстное меню для конкретных элементов в вашем документе. Вот пример добавления контекстного меню к элементу content:
   ```javascript
   on("body", "contextmenu", "main containers content", function (e) {
    e.preventDefault();
  
    ContextMenu.click([
      {
        name: "Пункт меню 1",
        ico: "upload",
        list: [
          {
            name: "Подпункт 1",
            ico: "upload",
            click: (elem) => {
              console.log(123, this, elem);
            },
          },
          {
            name: "Подпункт 2",
            ico: "upload",
            click: (elem) => {
              console.log(123, this, elem);
            },
          },
        ],
      },
      {
        hr: "true",
      },
      {
        name: "Пункт меню 2",
        ico: "download",
        click: (elem) => {
          console.log(123, this, elem);
        },
      },
      {
        hr: "true",
      },
      {
        name: "Пункт меню 3",
        ico: "folder",
        click: (elem) => {
          console.log(123, this, elem);
        },
      },
    ]);
   });

## Определение параметров
1. `name` : Название пункта меню.<br>
2. `ico` : Иконка пункта меню (это может быть класс иконки или путь к изображению).<br>
3. `list` : Массив подпунктов меню (если они есть). Каждый подпункт имеет свои параметры name, ico и click.<br>
4. `hr` : Горизонтальная линия-разделитель после данного пункта меню (если установлено значение "true").<br>
5. `click` : Обработчик клика на сам пункт меню (опционально). Этот обработчик вызывается при клике на пункт меню.<br>

### Обратите внимание, что параметры list и hr являются опциональными, и вы можете их опустить, если они не нужны.
