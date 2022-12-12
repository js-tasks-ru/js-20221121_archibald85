class Tooltip {
  static tooltipInstance;

  constructor() {
    if (!Tooltip.tooltipInstance) {
      Tooltip.tooltipInstance = this;
    }
    return  Tooltip.tooltipInstance;
  };

  initialize () {
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.pointerOverHandler);
    document.addEventListener('pointerout', this.pointerOutHandler);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.pointerOverHandler);
    document.removeEventListener('pointerout', this.pointerOutHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
  }

  pointerOverHandler = (event) => {
    if (event.target.dataset.tooltip != undefined) {
      this.render();
      this.element.innerHTML = event.target.dataset.tooltip;
      document.addEventListener('mousemove', this.mouseMoveHandler);
    };
  }

  pointerOutHandler = () => {
    this.remove();
    document.removeEventListener('mousemove', this.mouseMoveHandler);
  }

  mouseMoveHandler = (event) => {
    this.moveAt(event.pageX, event.pageY);
  }

  moveAt(posX, posY) {
    this.element.style.left = posX + 'px';
    this.element.style.top = posY + 'px';
  }

  render() {
    if (!this.element) {
      const element = document.createElement("div");
      element.innerHTML = this.template;
      this.element = element.firstElementChild;
      this.element.style.position = 'absolute';
      this.element.style.zIndex = 1000;
    }
    document.body.append(this.element);
  }

  get template() {
    return `<div class="tooltip"></div>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.removeEventListeners();
  }
}

export default Tooltip;
