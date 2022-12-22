import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
                data = [],
                label = '',
                value = 0,
                link = '',
                url = '',
                range = {
                  from: new Date(),
                  to: new Date()},
                formatHeading = data => data} = {})
  {
    this.label = label;
    this.data = data;
    this.value = formatHeading(value);
    this.link = link;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.formatHeading = formatHeading;
    this.render();
  }

  getColumnsTemplate(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map((item) => {
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
          ${this.getColumnsTemplate(this.data)}
        </div>
      </div>
    </div>
    `;
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  getsubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const subElements = {};

    elements.forEach((element) => {
      subElements[element.dataset.element] = element;
    });

    return subElements;
  }


  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getsubElements();
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);
    return  await fetchJson(this.url);
  }

  async update(dateStart = new Date, dateEnd = new Date()) {
    this.element.classList.add('column-chart_loading');
    const [from, to] = [dateStart, dateEnd].map(date => date.toISOString().split('T')[0]);
    const newData = await this.loadData(from, to);
    if (newData && Object.values(newData).length) {
      this.subElements.header.innerHTML = this.getHeaderValue(newData);
      this.subElements.body.innerHTML = this.getColumnsTemplate(Object.values(newData));
      this.element.classList.remove('column-chart_loading');
    }
    this.setDateInterval(dateStart, dateEnd);

    this.data = newData;

    return this.data;
  }

  setDateInterval(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

