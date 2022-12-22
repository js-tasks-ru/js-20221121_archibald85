import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  onScrollWindow = async () => {
    const endOfPage = () => {
      return window.pageYOffset + window.innerHeight === document.documentElement.scrollHeight
    }
    if(endOfPage() && !this.isLoading && !this.isSortLocally){
      this.start = this.end;
      this.end = this.start + this.offset;
      const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
      this.update(data);
    }
  }

  onHeaderClick = (event) => {
    let columnHeader = event.target.closest('.sortable-table__cell[data-id]');
    const {id, sortable, order} = columnHeader.dataset;
    if (sortable === 'false') {
      return;
    }
    const newOrder = order ? (order === 'asc' ? 'desc' : 'asc') : 'asc';

    this.sorted = {
      id,
      order: newOrder
    };

    this.sort(id, newOrder);
  }

  constructor(headerConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    url = '',
    start = 0,
    offset = 20,
    end = start + offset
  } = {}) {
    this.data = data;
    this.headerConfig = headerConfig;
    this.defaultSortOptions = sorted;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.start = start;
    this.offset = offset;
    this.end = end;
    this.isLoading = false;
    this.render();
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getUpdatableElements();
    this.addEventListeners();
    const newData = await this.loadData(this.sorted.id, this.sorted.order,this.start, this.end);
    this.data = newData;
    this.subElements.body.innerHTML = this.getRowsTemplate(this.data);
  }

  update(data) {
    const newProducts = document.createElement('div');
    this.data = [...this.data, ...data];
    newProducts.innerHTML = this.getRowsTemplate(data);
    this.subElements.body.append(...newProducts.childNodes);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');
    this.isLoading = true;
    const data = await fetchJson(this.url);
    this.isLoading = false;
    this.element.classList.remove('sortable-table_loading');

    return data;
  }


  get template() {
    return `
    <div class="sortable-table">
      ${this.getHeaderTemplate()}
      ${this.getBodyTemplate(this.data)}
    </div>
    `;
  }

  getHeaderTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(config => this.getHeaderRowTemplate(config)).join('')}
      </div>
    `;
  }

  getHeaderRowTemplate({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `
  }

  getBodyTemplate(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${data.map((item) => this.getBodyRowTemplate(item)).join('')}
      </div>
    `;
  }

  getRowsTemplate(data) {
    return `
        ${data.map((item) => this.getBodyRowTemplate(item)).join('')}
    `;
  }

  getBodyRowTemplate(item) {
    return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getCellsTemplate(item)}
      </a>
    `;
  }

  getCellsTemplate(product) {
    const columns = this.headerConfig.map(({id, template}) => {
      return {id, template}
    });
    return columns.map((column) => {
      return column.template ?
        column.template(product[column.id]) :
        `<div class="sortable-table__cell">${product[column.id]}</div>`;
    }).join('');
  }

  getUpdatableElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const subElements = {};

    elements.forEach((element) => {
      subElements[element.dataset.element] = element;
    });

    return subElements;
  }

  sort(fieldValue, orderValue) {
    const headerColumns = document.querySelectorAll('.sortable-table__cell[data-id]');
    const sortedColumn = document.querySelector(`.sortable-table__cell[data-id =${fieldValue}]`);
    headerColumns.forEach((column) => {
      column.dataset.order = '';
    });
    sortedColumn.dataset.order = orderValue;
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer(fieldValue, orderValue);
    }
  }

  defaultSort = () => {
    const {id, order} = this.defaultSortOptions;
    if(id && order) {
      this.sort(id, order);
    }
  }

  sortOnClient(fieldValue, orderValue) {
    const sortedProducts = this.sortProducts(fieldValue, orderValue);
    this.subElements.body.innerHTML = this.getRowsTemplate(sortedProducts);
  }

  async sortOnServer(fieldValue, orderValue) {
    const start = 0;
    const end = start + this.offset;
    const newData = await this.loadData(fieldValue, orderValue, start, end);
    this.data = newData;
    this.subElements.body.innerHTML = this.getRowsTemplate(this.data);
  }

  sortProducts(field, value) {
    const sortedProducts = [...this.data];
    const sortedColumn = this.headerConfig.find(config => config.id === field);
    const {sortType} = sortedColumn;
    const directions = {
      'asc': 1,
      'desc': -1,
    };
    const currentDirection = directions[value];

    return sortedProducts.sort((a, b) => {
      if (sortType === 'number') {
        return currentDirection * (a[field] - b[field]);
      }
      if (sortType === 'string') {
        return currentDirection * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
      }
      return 0;
    });
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
    document.addEventListener("DOMContentLoaded", this.defaultSort);
    window.addEventListener('scroll', this.onScrollWindow);
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.onHeaderClick);
    document.removeEventListener("DOMContentLoaded", () => this.defaultSort);
    window.removeEventListener('scroll', this.onScrollWindow);
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
