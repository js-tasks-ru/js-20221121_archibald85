import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  onRemoveImage = (event) => {
    const target = event.target;
    if ('deleteHandle' in target.dataset) {
      const imageItem = target.closest('li');
      imageItem.remove();
    }
  }
  constructor(productId) {
    this.productId = productId;
    this.emptyProduct = {
      title: '',
      description: '',
      quantity: 0,
      status: 0,
      images: [],
      price: 0,
      discount: 0
    };
    this.categories = [];
  }

  async render() {
    const loadCategories = this.loadCategories();
    const loadProduct = this.productId ? this.loadProduct(this.productId) : Promise.resolve(this.emptyProduct);
    const [categories, [product]] = await Promise.all([loadCategories, loadProduct]);
    this.categories = categories;
    this.product = product;
    this.renderView();
  }

  renderView() {
    const element = document.createElement("div");
    element.innerHTML = this.product ? this.template : this.noProductTemplate;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    if (this.product) {
      this.setProductForm();
      this.addEventListeners();
    }
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const subElements = {};

    elements.forEach((element) => {
      subElements[element.dataset.element] = element;
    });

    return subElements;
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
                <ul class="sortable-list">${this.createImages()}</ul>
            </div>
            <button type="button" id="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.createCategories()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id="status" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" id="save" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `
  }

  get noProductTemplate() {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  createCategories() {
    const categoryList = [];
    this.categories.forEach((category) => {
       category.subcategories.forEach((subcategory) => {
         categoryList.push(`<option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`);
       })
     });
    return `<select class="form-control" id="subcategory" name="subcategory">${categoryList.join('')}</select>`;
  }

  createImages() {
    return this.product.images.map((imageData) => this.getImageItem(imageData)).join('');
  }

  getImageItem(imageData) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${imageData.url}">
          <input type="hidden" name="source" value="${imageData.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(imageData.source)}" src="${escapeHtml(imageData.url)}">
            <span>${escapeHtml(imageData.source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      </li>`
  }

  addEventListeners() {
    const {productForm, imageListContainer} = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    imageListContainer.addEventListener('click', this.onRemoveImage);
  }

  async save() {
    const product = Object.assign(this.getProductForm(), {id : this.productId});
    const url = new URL('/api/rest/products', BACKEND_URL);
    try {
      const result = await fetchJson(url, {
        method : this.productId ? 'PATCH' : 'PUT',
        headers : {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      this.dispatchProductEvent(result.id)
    } catch (error) {
      console.log('Error:', error);
    }
  }

  setProductForm() {
    const {productForm} = this.subElements;
    const ignoredFields = ['images'];
    const productFields = Object.keys(this.emptyProduct).filter(key => !ignoredFields.includes(key));
    productFields.forEach((field) => {
      const element = productForm.querySelector(`[name=${field}]`);
      element.value = this.product[field] || this.emptyProduct[field];
    })
  }

  getProductForm() {
    const product = {};
    const {productForm} = this.subElements;
    const ignoredFields = ['images'];
    const numericFields = ['quantity','status','price','discount'];
    const productFields = Object.keys(this.emptyProduct).filter(key => !ignoredFields.includes(key));

    productFields.forEach((field) => {
      const element = productForm.querySelector(`[name=${field}]`);
      product[field] = numericFields.includes(field) ? parseInt(element.value) : element.value;
    })
    product.images = this.getProductImages();
    return product;
  }

  getProductImages() {
    const images = {};
    const {imageListContainer} = this.subElements;
    const imagesElements = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    return [...imagesElements].map((element) => { return {source: element.alt, url: element.src}});
  }

  async loadProduct(productId) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', productId);
    return await fetchJson(url);
  }

  async loadCategories() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  dispatchProductEvent(productId) {
   const eventType = this.productId ? 'product-updated' : 'product-saved';
   const productEvent = new CustomEvent(eventType, {detail : productId});
   this.element.dispatchEvent(productEvent);
  }

  removeEventListeners() {
    const {productForm, imageListContainer} = this.subElements;
    productForm.removeEventListener('submit', this.onSubmit);
    imageListContainer.removeEventListener('click', this.onRemoveImage);
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
