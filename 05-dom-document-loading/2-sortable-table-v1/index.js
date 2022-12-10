export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
    this.subElements = this.getUpdatebleElements();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
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

  getBodyRowTemplate(item) {
    return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getCellsTemplate(item)}
      </a>
    `;
  }

  getCellsTemplate(product) {
    const columns = this.headerConfig.map(({id, template}) => { return {id, template}});
    return columns.map((column) => {
      return column.template ?
        column.template(product[column.id]) :
        `<div class="sortable-table__cell">${product[column.id]}</div>`;
      }).join('');
  }

  getUpdatebleElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const subElements = {};

    elements.forEach((element) => {
      subElements[element.dataset.element] = element;
    });

    return subElements;
  }

  sort(fieldValue, orderValue) {
    const sortedProducts = this.sortProducts(fieldValue, orderValue);
    const headerColumns = document.querySelectorAll('.sortable-table__cell[data-id]');
    const sortedColumn = document.querySelector(`.sortable-table__cell[data-id =${fieldValue}]`);
    headerColumns.forEach((column) => {
      column.dataset.order = '';
    });
    sortedColumn.dataset.order = orderValue;
    this.subElements.body.innerHTML = this.getBodyTemplate(sortedProducts);
  }

  sortProducts(field, value) {
    const sortedProducts = [...this.data];
    const sortedColumn = this.headerConfig.find(config => config.id === field);
    const {sortType} = sortedColumn;
    console.log(sortedColumn);
    const directions = {
      'asc' : 1,
      'desc' : -1,
    };
    const currentDirection = directions[value];

    return sortedProducts.sort((a,b) => {
      if (sortType === 'number') {
        return currentDirection * (a[field] - b[field]);
      }
      if(sortType === 'string') {
        return currentDirection * a[field].localeCompare(b[field], ['ru', 'en'],{caseFirst : 'upper'});
      }
      return 0;
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

