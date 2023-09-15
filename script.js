var ContextMenu = {
  var: {
    DEBUG: true,
    events: ["click", "dblclick", "keypress", "keydown"],
    swipe: {
      x_start: undefined,
      y_start: undefined,
      x_move: undefined,
      y_move: undefined,
      x_end: undefined,
      y_end: undefined,
      x_distance: 0,
      y_distance: undefined,
      speed: undefined,
      duration: undefined,
      last_duration: undefined,
      block: undefined,
      transition: undefined,
      y_percent: 0,
      x_percent: 0,
      time: 0,
      time_interval: undefined,
      diss: undefined,
      i: 0,
      status: false,
      status_right: true,
    },
  },
  init: async (p) => {
    if (p == undefined) return false;
    if (p.template == undefined || p.template == "") return false;
    if (p.selector == undefined || p.selector == "") return false;

    if (p.style) {
      ContextMenu.includeCSS(p.style);
    }

    let template = await ContextMenu.fetchHTML(p.template);

    await document
      .querySelector(p.selector)
      .insertAdjacentHTML("afterbegin", template);

    if (ContextMenu.var.DEBUG == undefined) {
      ContextMenu.var.DEBUG = true;
    }

    // Запрещяем котекст меню в программе но если включен дебаг то можно
    document.body.addEventListener("contextmenu", function (e) {
      if (DEBUG) {
        if (!e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Отслеживаем нажатие на раскрытие выпадающего списка в контекстном меню
    document.body.addEventListener("click", function (e) {
      if (e.target.matches("contextmenuitem")) {
        if (document.documentElement.clientWidth <= 500) {
          let contextMenuItem = e.target;
          let contextMenuList =
            contextMenuItem.querySelector("contextmenulist");

          if (contextMenuList) {
            if (!contextMenuItem.hasAttribute("active")) {
              contextMenuItem.setAttribute("active", "");
              let h = contextMenuList.scrollHeight;
              contextMenuList.style.height = h + "px";
              contextMenuList.style.marginTop = "10px";
            } else {
              contextMenuItem.removeAttribute("active");
              contextMenuList.style.height = "";
              contextMenuList.style.marginTop = "";
            }

            setTimeout(() => {
              let contextMenu = document.querySelector("contextmenu");
              let contextMenuScreen =
                document.querySelector("contextmenuscreen");

              if (contextMenu) {
                if (
                  document.documentElement.clientHeight <
                  contextMenu.offsetHeight
                ) {
                  contextMenuScreen.style.display = "";
                  contextMenuScreen.style.alignItems = "";

                  if (contextMenuScreen.hasAttribute("grid")) {
                    contextMenuScreen.scrollTop =
                      contextMenu.offsetHeight -
                      document.documentElement.clientHeight +
                      document.documentElement.clientHeight * 0.35;
                  }
                } else {
                  if (contextMenuScreen.hasAttribute("grid")) {
                    contextMenuScreen.style.display = "inline-grid";
                    contextMenuScreen.style.alignItems = "end";
                  }
                }
              }
            }, parseFloat(window.getComputedStyle(contextMenuList).transitionDuration) * 1000 + 50);
          }
        }
      }
    });

    // Определения скрола в контекстном меню, дошли ли мы до верха экрана или нет плюс если меню меньше определенных значений, то добавляем grid сетку
    document
      .querySelector("contextmenuscreen")
      .addEventListener("scroll", function (e) {
        let contextMenu = document.querySelector("contextmenu");
        let themeCookie =
          document.cookie.indexOf("theme=light") !== -1 ? "light" : "dark";

        if (
          document.documentElement.clientHeight * 0.65 >
          contextMenu.offsetHeight
        ) {
          this.style.display = "inline-grid";
          this.style.alignItems = "end";
        } else {
          this.style.display = "";
          this.style.alignItems = "";
        }

        if (document.documentElement.clientHeight * 0.35 < this.scrollTop) {
          let themeColor = themeCookie === "light" ? "#fff" : "#3e3e3e";
          document
            .querySelector('meta[name="theme-color"]')
            .setAttribute("content", themeColor);
          contextMenu.style.borderRadius = "0px";
        } else {
          let themeColor = themeCookie === "light" ? "#737373" : "#121212";
          document
            .querySelector('meta[name="theme-color"]')
            .setAttribute("content", themeColor);
          contextMenu.style.borderRadius = "";
        }
      });

    // Получите все подходящие элементы и добавьте обработчик события wheel
    var elements = document.querySelectorAll(
      ".fileManager-main-toolbar > div ~ div"
    );
    elements.forEach(function (element) {
      element.addEventListener("wheel", function (e) {
        // Измените горизонтальную прокрутку элемента на основе значения deltaY
        element.scrollLeft += e.deltaY;
      });
    });

    // Обработка скрытия контекстного меню
    var elements = document.querySelectorAll("body");
    elements.forEach(function (element) {
      ContextMenu.var.events.forEach((ev) => {
        element.addEventListener(ev, function (e) {
          if (!element.getAttribute("visible-context")) {
            ContextMenu.close(e);
          }
        });
      });
    });

    // Обработка скрытия контекстного меню
    window.addEventListener("resize", function (e) {
      ContextMenu.status(false);
    });

    // Обработка скрытия контекстного меню
    var elements = document.querySelectorAll("*");
    elements.forEach(function (element) {
      element.addEventListener("scroll", function (e) {
        ContextMenu.close(e);
      });
    });

    // Обработка свайпа закрытия контекстного меню
    document.body.addEventListener("touchstart", function (e) {
      if (
        document.documentElement.clientWidth <= 500 &&
        e.target.matches("contextmenu")
      ) {
        ContextMenu.swipe.touchstart(e, e.target);
      }
    });

    // Обработка свайпа закрытия контекстного меню
    document.body.addEventListener("touchmove", function (e) {
      if (
        document.documentElement.clientWidth <= 500 &&
        e.target.matches("contextmenu")
      ) {
        ContextMenu.swipe.touchmove(e, document.querySelector("contextmenu"));
      }
    });

    // Обработка свайпа закрытия контекстного меню
    document.body.addEventListener("touchend", function (e) {
      if (
        document.documentElement.clientWidth <= 500 &&
        e.target.matches("contextmenu")
      ) {
        ContextMenu.swipe.touchend(e, e.target);
      }
    });
  },
  on: (elSelector, eventName, selector, fn) => {
    var element = document.querySelector(elSelector);

    element.addEventListener(eventName, function (event) {
      var possibleTargets = element.querySelectorAll(selector);
      var target = event.target;

      for (var i = 0, l = possibleTargets.length; i < l; i++) {
        var el = target;
        var p = possibleTargets[i];

        while (el && el !== element) {
          if (el === p) {
            return fn.call(p, event);
          }

          el = el.parentNode;
        }
      }
    });
  },
  fetchHTML: async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return await response.text();
    } catch (error) {
      return null;
    }
  },
  includeCSS: (aFile, attrs) => {
    let style = window.document.createElement("link");
    style.href = aFile;
    style.rel = "stylesheet";
    style.type = "text/css";

    if (attrs != undefined) {
      if (typeof attrs == "object") {
        for (const key in attrs) {
          const attr = attrs[key];
          style.setAttribute(key, attr);
        }
      }
    }

    document.head.appendChild(style);
  },
  swipe: {
    touchstart: (e, elem) => {
      // Задаем значения переменных ContextMenu.var.swipe
      ContextMenu.var.swipe.transition = getComputedStyle(elem).transition;
      ContextMenu.var.swipe.time = 0;
      ContextMenu.var.swipe.diss = 0;
      ContextMenu.var.swipe.x_start = e.touches[0].clientX;
      ContextMenu.var.swipe.y_start = e.touches[0].clientY;
      ContextMenu.var.swipe.block = elem;
      ContextMenu.var.swipe.f = true;

      // Проверяем условия для ContextMenu.var.swipe.status
      if (
        elem.parentElement &&
        elem.parentElement.matches("contextmenuscreen")
      ) {
        if (elem.parentElement.scrollTop !== 0) {
          ContextMenu.var.swipe.f = false;
        }
      }

      if (!ContextMenu.var.swipe.f) {
        ContextMenu.var.swipe.status = false;
      } else {
        if (
          document.documentElement.clientHeight * 0.35 <
          elem.parentElement.scrollTop
        ) {
          ContextMenu.var.swipe.status = false;
        } else {
          ContextMenu.var.swipe.status = true;
        }
      }

      if (e.targetTouches.length !== 1) {
        ContextMenu.var.swipe.status = false;
      }
    },
    touchmove: (e, elem) => {
      if (
        elem.parentElement &&
        elem.parentElement.matches("contextmenuscreen")
      ) {
        if (elem.parentElement.scrollTop !== 0) {
          ContextMenu.var.swipe.f = false;
        }
      }

      if (!ContextMenu.var.swipe.f) {
        ContextMenu.var.swipe.status = false;
      } else {
        if (
          document.documentElement.clientHeight * 0.35 <
          elem.parentElement.scrollTop
        ) {
          ContextMenu.var.swipe.status = false;
        }
      }

      if (ContextMenu.var.swipe.status) {
        var duration;

        if (
          ContextMenu.var.swipe.y_start - e.touches[0].clientY >
          ContextMenu.var.swipe.y_distance
        ) {
          duration = "top";
        } else if (
          ContextMenu.var.swipe.y_start - e.touches[0].clientY <
          ContextMenu.var.swipe.y_distance
        ) {
          duration = "bottom";
        } else if (
          ContextMenu.var.swipe.x_start - e.touches[0].clientX <
          ContextMenu.var.swipe.x_distance
        ) {
          duration = "right";
        } else if (
          ContextMenu.var.swipe.x_start - e.touches[0].clientX >
          ContextMenu.var.swipe.x_distance
        ) {
          duration = "left";
        } else {
          duration = ContextMenu.var.swipe.last_duration;
        }

        if (ContextMenu.var.swipe.last_duration != duration) {
          ContextMenu.var.swipe.time = 0;
          ContextMenu.var.swipe.diss = 0;
        } else {
          ContextMenu.var.swipe.diss++;
        }
        ContextMenu.var.swipe.last_duration = duration;

        ContextMenu.var.swipe.x_move = e.touches[0].clientX;
        ContextMenu.var.swipe.y_move = e.touches[0].clientY;
        ContextMenu.var.swipe.x_distance =
          ContextMenu.var.swipe.x_start - ContextMenu.var.swipe.x_move;
        ContextMenu.var.swipe.y_distance =
          ContextMenu.var.swipe.y_start - ContextMenu.var.swipe.y_move;
        ContextMenu.var.swipe.xy_distance = Math.sqrt(
          Math.pow(ContextMenu.var.swipe.x_distance, 2) +
            Math.pow(ContextMenu.var.swipe.y_distance, 2)
        );
        ContextMenu.var.swipe.time++;
        ContextMenu.var.swipe.block.style.transition = "0s all";

        e.stopImmediatePropagation();
        e.stopPropagation();

        if (ContextMenu.var.swipe.i < 3) {
          if (
            Math.abs(ContextMenu.var.swipe.x_distance) >
            Math.abs(ContextMenu.var.swipe.y_distance)
          ) {
            if (ContextMenu.var.swipe.x_distance > 0) {
              // left
              ContextMenu.var.swipe.duration = "left";
            } else {
              // right
              ContextMenu.var.swipe.duration = "right";
            }
          } else {
            if (ContextMenu.var.swipe.y_distance > 0) {
              // top
              ContextMenu.var.swipe.duration = "top";
            } else {
              // bottom
              ContextMenu.var.swipe.duration = "bottom";
            }
          }
          ContextMenu.var.swipe.i++;
        } else {
          if (ContextMenu.var.swipe.duration == "bottom") {
            if (ContextMenu.var.swipe.y_distance <= 0) {
              if (document.documentElement.clientWidth <= 500) {
                ContextMenu.var.swipe.block.style.transform =
                  "translate(0%, " +
                  (-ContextMenu.var.swipe.y_distance - 0) +
                  "px)";
              }
            }
          }

          if (
            ContextMenu.var.swipe.x_distance == 0 ||
            ContextMenu.var.swipe.y_distance == 0
          ) {
            ContextMenu.var.swipe.time = 0;
          }
        }
      }

      // console.log(e)
    },
    touchend: (e, elem) => {
      if (ContextMenu.var.swipe.status) {
        var speed_lim = 0.96;
        ContextMenu.var.swipe.x_end = e.changedTouches[0].pageX;
        ContextMenu.var.swipe.y_end = e.changedTouches[0].pageY;
        ContextMenu.var.swipe.x_distance =
          ContextMenu.var.swipe.x_start - ContextMenu.var.swipe.x_end;
        ContextMenu.var.swipe.y_distance =
          ContextMenu.var.swipe.y_start - ContextMenu.var.swipe.y_end;
        ContextMenu.var.swipe.y_percent = Math.abs(
          (ContextMenu.var.swipe.y_distance * 100) / elem.offsetHeight
        );
        ContextMenu.var.swipe.x_percent = Math.abs(
          (ContextMenu.var.swipe.x_distance * 100) / elem.offsetWidth
        );
        ContextMenu.var.swipe.xy_distance = Math.sqrt(
          Math.pow(ContextMenu.var.swipe.x_distance, 2) +
            Math.pow(ContextMenu.var.swipe.y_distance, 2)
        );
        ContextMenu.var.swipe.speed = Math.abs(
          ContextMenu.var.swipe.diss / ContextMenu.var.swipe.time
        );
        ContextMenu.var.swipe.i = 0;

        if (
          ContextMenu.var.swipe.speed !== Infinity &&
          (Math.abs(ContextMenu.var.swipe.y_distance) > 200 ||
            ContextMenu.var.swipe.y_percent > 40)
        ) {
          if (ContextMenu.var.swipe.speed < speed_lim) {
            ContextMenu.var.swipe.block.style.transition =
              ContextMenu.var.swipe.speed / 3 + "s all";
          } else {
            ContextMenu.var.swipe.block.style.transition =
              ContextMenu.var.swipe.transition;
          }

          if (ContextMenu.var.swipe.duration == "bottom") {
            if (ContextMenu.var.swipe.last_duration == "bottom") {
              ContextMenu.status(false);
            } else {
              if (document.documentElement.clientWidth <= 500) {
                ContextMenu.var.swipe.block.style.transform =
                  "translate(0%, 0px)";
              }
              ContextMenu.var.swipe.block.style.transition =
                ContextMenu.var.swipe.speed / 3 + "s all";
              setTimeout(() => {
                ContextMenu.var.swipe.block.style.transition =
                  ContextMenu.var.swipe.transition;
              }, 100);
            }
          } else {
            ContextMenu.var.swipe.block.style.transition =
              ContextMenu.var.swipe.transition;
            if (document.documentElement.clientWidth <= 500) {
              ContextMenu.var.swipe.block.style.transform =
                "translate(0%, 0px)";
            }
          }
        } else {
          ContextMenu.var.swipe.block.style.transition =
            ContextMenu.var.swipe.transition;
          if (document.documentElement.clientWidth <= 500) {
            ContextMenu.var.swipe.block.style.transform = "translate(0%, 0px)";
          }
        }
        ContextMenu.var.swipe.duration = undefined;
      }
    },
  },
  click: (obj) => {
    if (ContextMenu.var.DEBUG) {
      if (event.ctrlKey !== undefined) {
        if (!event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
        }
      } else {
        event.preventDefault();
        event.stopPropagation();
      }
    } else {
      event.preventDefault();
      event.stopPropagation();
    }

    let activeMenu = true;

    if (ContextMenu.var.DEBUG) {
      if (event.ctrlKey) {
        activeMenu = false;
      }
    }

    if (activeMenu) {
      let coords = {
        x: event.pageX,
        y: event.pageY,
      };

      let contextMenu = document.querySelector("contextmenu");
      contextMenu.removeAttribute("style");

      let contentItems = ContextMenu.parse(obj);

      let contextMenuContent = document.querySelector("contextmenucontent");
      contextMenuContent.innerHTML = contentItems;

      if (
        !(
          document.documentElement.clientHeight >
          contextMenu.offsetHeight + coords.y + 5
        )
      ) {
        coords.y -= Math.abs(
          document.documentElement.clientHeight -
            (contextMenu.offsetHeight + coords.y + 5)
        );
      }

      if (
        !(
          document.documentElement.clientWidth >
          contextMenu.offsetWidth + coords.x + 5
        )
      ) {
        coords.x -= Math.abs(
          document.documentElement.clientWidth -
            (contextMenu.offsetWidth + coords.x + 5)
        );
      }

      contextMenu.style.left = `${coords.x}px`;
      contextMenu.style.top = `${coords.y}px`;
      ContextMenu.status(true);

      setTimeout(() => {
        // Обработка появления контекстных списков в меню
        const contextmenuitems = document.querySelectorAll(
          "body contextmenuitem"
        );

        contextmenuitems.forEach((element) => {
          element.addEventListener("mouseenter", function (e) {
            let elem = e.target.querySelector("contextmenulist");
            if (elem) {
              let type = "";

              // Сам блок в котором мы + ширины нашего блока + (сам выпадающий список - 10 пикселей смещения в сторону)
              if (
                document.documentElement.clientWidth >
                e.target.getBoundingClientRect().x +
                  e.target.offsetWidth +
                  elem.offsetWidth
              ) {
                type += "right";
              } else {
                type += "left";
              }

              if (
                document.documentElement.clientHeight >
                e.target.getBoundingClientRect().y +
                  e.target.offsetHeight +
                  elem.offsetHeight
              ) {
                type += "_top";
              } else {
                type += "_bottom";
              }

              elem.setAttribute("type", type);
            }
          });
        });
      }, 1);
    }
  },
  list: (obj, elem) => {
    let coords = {};

    if (event !== undefined) {
      event.preventDefault();
      event.stopPropagation();
    }

    let c = elem.getBoundingClientRect();

    coords.x = c.x;
    coords.y = c.y + c.height;

    let contextMenu = document.querySelector("contextmenu");
    contextMenu.removeAttribute("style");

    let contentItems = ContextMenu.parse(obj);

    let contextMenuContent = document.querySelector("contextmenucontent");
    contextMenuContent.innerHTML = contentItems;

    if (
      !(
        document.documentElement.clientHeight >
        contextMenu.offsetHeight + coords.y + 5
      )
    ) {
      coords.y -= Math.abs(
        document.documentElement.clientHeight -
          (contextMenu.offsetHeight + coords.y + 5)
      );
    }

    if (
      !(
        document.documentElement.clientWidth >
        contextMenu.offsetWidth + coords.x + 5
      )
    ) {
      coords.x -= Math.abs(
        document.documentElement.clientWidth -
          (contextMenu.offsetWidth + coords.x + 5)
      );
    }

    contextMenu.style.left = `${coords.x}px`;
    contextMenu.style.top = `${coords.y}px`;
    ContextMenu.status(true);
  },
  parse: (obj) => {
    let res = "";

    if (typeof obj == "string") {
      obj = JSON.parse(obj);
    }

    obj.forEach((elem) => {
      const idRandom = ContextMenu.randomId(32);
      // Если нет выпадающего списка
      if (elem.list == undefined) {
        if (elem.hr != undefined) {
          if (elem.hr == "true") {
            res += "  <contextmenuitem hr></contextmenuitem>\n";
          }
        } else {
          res += `<contextmenuitem clickeffects id="${idRandom}">\n`;
          res += `  <div class='contextmenuitem-content'>\n`;
          res += `    <div class="contextmenuitem-ico icons-${elem.ico}" ${
            elem.ico_attr != undefined ? elem.ico_attr : ""
          }></div>\n`;
          res += `    <div class="contextmenuitem-text">${elem.name}</div>\n`;
          res += `  </div>\n`;
          res += "</contextmenuitem>\n";

          ContextMenu.on(
            "body",
            "click",
            `body contextmenu contextmenuitem#` + idRandom
          , function(){
            elem.click(this);
          });
        }
      }

      // Если есть выпадающий список
      else {
        res += `<contextmenuitem>\n`;
        res += `  <div class='contextmenuitem-content'>\n`;
        res += `    <div class="contextmenuitem-ico icons-${elem.ico}" ${
          elem.ico_attr != undefined ? elem.ico_attr : ""
        }></div>\n`;
        res += `    <div class="contextmenuitem-text">${elem.name}</div>\n`;
        res += `    <div class="contextmenuitem-more icons-right"></div>\n`;
        res += `  </div>\n`;
        res += `  <contextmenulist>\n`;
        res += ContextMenu.parse(elem.list);
        res += `  </contextmenulist>\n`;
        res += "</contextmenuitem>\n";
      }
    });
    return res;
  },
  close: (e) => {
    if (ContextMenu.status() && e.ctrlKey === false) {
      let g = true;
      let g2 = false;

      if (e.path && e.path.forEach) {
        e.path.forEach((item) => {
          if (item.tagName === "CONTEXTMENU") {
            if (!g2) {
              g = false;
            }
          }
        });
      }

      if (g) {
        ContextMenu.status(false);
      }
    }
  },
  status: (stat) => {
    if (stat === undefined) {
      return (
        document.querySelector("contextmenu").getAttribute("active") !== null
      );
    } else {
      if (stat === true) {
        if (navigator.vibrate) {
          if (event !== undefined) {
            if (event.type === "contextmenu") navigator.vibrate(100);
          }
        }
        if (document.documentElement.clientWidth <= 500) {
          if (document.cookie.includes("theme=light")) {
            document
              .querySelector('meta[name="theme-color"]')
              .setAttribute("content", "#737373");
          } else {
            document
              .querySelector('meta[name="theme-color"]')
              .setAttribute("content", "#121212");
          }
        }

        let contextMenuScreen = document.querySelector("contextmenuscreen");

        if (
          document.documentElement.clientHeight * 0.65 >
          document.querySelector("contextmenu").offsetHeight
        ) {
          contextMenuScreen.style.display = "inline-grid";
          contextMenuScreen.style.alignItems = "end";
          contextMenuScreen.setAttribute("grid", "");
        } else {
          contextMenuScreen.style.display = "";
          contextMenuScreen.style.alignItems = "";
          contextMenuScreen.removeAttribute("grid");
        }

        document.querySelector("contextmenu").setAttribute("active", "");
        contextMenuScreen.setAttribute("active", "");
      } else {
        let contextMenuScreen = document.querySelector("contextmenuscreen");
        contextMenuScreen.removeAttribute("grid");
        document.querySelector("contextmenu").removeAttribute("active");
        contextMenuScreen.removeAttribute("active");
        if (document.documentElement.clientWidth <= 500) {
          document.querySelector("contextmenu").style.transform = "";
          if (document.cookie.includes("theme=light")) {
            document
              .querySelector('meta[name="theme-color"]')
              .setAttribute("content", "#fff");
          } else {
            document
              .querySelector('meta[name="theme-color"]')
              .setAttribute("content", "#272727");
          }
        }

        setTimeout(() => {
          contextMenuScreen.scrollTop = 0;
        }, 250);
      }
    }
  },
  randomId: (n) => {
    if (n == undefined) {
      n = 15;
    }
    let alphabet =
        "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0987654321",
      word = "";

    for (let i = 0; i < n; i++) {
      if (i == 0) {
        word += "i";
      } else {
        word += alphabet[Math.round(Math.random() * (alphabet.length - 1))];
      }
    }
    return word;
  },
};

export default ContextMenu;
