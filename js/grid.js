const startGridGame = (imgSrc) => {
  window.currentChildId = -1;
  const dragMoveListener = (event) => {
    var target = event.target;
    var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.transform = "translate(" + x + "px, " + y + "px)";

    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
    target.classList.add("drag-current");
  };
  window.dragMoveListener = dragMoveListener;

  const dragOnStartListener = (event) => {
    event.target.parentNode.classList.add("drag-move");
  };
  window.dragOnStartListener = dragOnStartListener;

  const dragOnEndListener = (event) => {
    event.target.parentNode.classList.remove("drag-move");
  };
  window.dragOnEndListener = dragOnEndListener;

  const cropImage = (imagePath, canvas, sx, sy, sWidth, sHeight) => {
    const originalImage = new Image();
    originalImage.src = imagePath;

    const ctx = canvas.getContext("2d");

    originalImage.addEventListener("load", function (e) {
      const wMod = e.target.width / 3;
      const hMod = e.target.height / 3;

      const sX = wMod * sx;
      const sY = hMod * sy;
      const sW = wMod * sWidth;
      const sH = hMod * sHeight;

      canvas.width = wMod;
      canvas.height = hMod;

      ctx.drawImage(originalImage, sX, sY, sW, sH, 0, 0, sW, sH);
    });
  };

  const game = document.querySelector('[data-grid-game="game"]');
  const images = game.querySelectorAll('[data-grid-game="element"]');
  images.forEach((image, i) => {
    if (i == 0) cropImage(imgSrc, image, 0, 0, 1, 1);
    if (i == 1) cropImage(imgSrc, image, 1, 0, 1, 1);
    if (i == 2) cropImage(imgSrc, image, 2, 0, 3, 1);
    if (i == 3) cropImage(imgSrc, image, 0, 1, 1, 1);
    if (i == 4) cropImage(imgSrc, image, 1, 1, 1, 1);
    if (i == 5) cropImage(imgSrc, image, 2, 1, 3, 1);
    if (i == 6) cropImage(imgSrc, image, 0, 2, 1, 3);
    if (i == 7) cropImage(imgSrc, image, 1, 2, 1, 3);
    if (i == 8) cropImage(imgSrc, image, 2, 2, 3, 3);
  });
  images.forEach((image, i) => {
    image.setAttribute("data-grid-game-i", i);
  });

  const containers = game.querySelectorAll("[data-grid-game-i]");

  for (i = containers.length; i >= 0; i--) {
    game.appendChild(containers[(Math.random() * i) | 0].parentNode);
  }

  const onElemDrop = (event) => {
    const currentElement = game.querySelector(".drag-current");
    currentElement.classList.remove("drag-current");
    event.target.classList.remove("drop-target");
    currentElement.style.transform = "";
    currentElement.removeAttribute("data-x");
    currentElement.removeAttribute("data-y");
    event.target.appendChild(currentElement);

    const movedElem = game.querySelector(
      `[data-grid-game-i="${window.currentChildId}"]`
    );
    if (movedElem) movedElem.style.marginLeft = "";

    const orderContainers = game.querySelectorAll("[data-grid-game-i]");
    const compareObj = Array.from(orderContainers).map((container, i) => {
      const containerId = container.getAttribute("data-grid-game-i");
      return i === Number(containerId) ? true : false;
    });
    const checkGame = compareObj.every(element => element === true)
    if (checkGame) {
      // Win game
      const youwin = document.getElementById('youwin')
      youwin.innerHTML = 'Поздравляю, ты выиграл(а)'
      stopGridGame();
    }
  };

  interact(".grid-game__box").dropzone({
    overlap: 0.35,
    ondropactivate: function (event) {
      event.target.classList.add("drop-active");
    },
    ondragenter: function (event) {
      event.target.classList.add("drop-target");
      const dragElem = game.querySelector(".drag-move");
      const targetElem = event.target;
      if (
        !targetElem.classList.contains("drag-move") &&
        targetElem.hasChildNodes() &&
        dragElem.hasChildNodes()
      ) {
        const targetElemChild = targetElem.firstChild;
        dragElem.appendChild(targetElemChild);
        targetElemChild.style.marginLeft = `-${dragElem.offsetWidth}px`;
        window.currentChildId =
          targetElemChild.getAttribute("data-grid-game-i");
      }
    },
    ondragleave: function (event) {
      event.target.classList.remove("drop-target");
      const dragElem = game.querySelector(".drag-move");
      if (dragElem.childNodes.length > 1) {
        const dragElemChild = dragElem.lastChild;
        event.target.appendChild(dragElemChild);
        dragElemChild.style.marginLeft = ``;
      }
    },
    ondrop: onElemDrop,
    ondropdeactivate: function (event) {
      event.target.classList.remove("drop-active");
    },
  });
  interact(".grid-game").dropzone({
    ondrop: onElemDrop,
  });

  interact(".grid-game__element").draggable({
    inertia: false,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: game,
        endOnly: false,
      }),
    ],
    autoScroll: false,
    listeners: {
      move: dragMoveListener,
    },
  });
  interact(".grid-game__element").on("down", dragOnStartListener);
  interact(".grid-game__element").on("up", dragOnEndListener);
};
const stopGridGame = () => {
  interact(".grid-game__box").unset();
  interact(".grid-game").unset();
  interact(".grid-game__element").unset();
}
const resetGridGame = (imgSrc) => {
  stopGridGame();
  const youwin = document.getElementById('youwin')
  youwin.innerHTML = 'Удачи!'
  startGridGame(imgSrc);
};
