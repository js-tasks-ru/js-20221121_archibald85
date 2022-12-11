export default class ColumnChart {
  chartHeight = 50;
  innerElements = {};

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = data => data} = {})
  {
    this.label = label;
    this.data = data;
    this.value = formatHeading(value);
    this.link = link;
    this.render();
  }

  getColumnsTemplate() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map((item) => {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value = Math.floor(item * scale);
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
    }).join('');
  }

  getTemplate() {
    return `
    <div class="column-chart ${!this.data.length ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ''}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getColumnsTemplate()}
        </div>
      </div>
    </div>
    `;

  }

  getInnerElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const innerElements = {};

    elements.forEach((element) => {
      innerElements[element.dataset.element] = element;
    });

    return innerElements;
  }


  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.innerElements = this.getInnerElements();

  }

  update(data = []) {
    this.data = data;
    this.innerElements.body.innerHTML = this.getColumnsTemplate();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = {};
    this.innerElements = {};
  }
}
