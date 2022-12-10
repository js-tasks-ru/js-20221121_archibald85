export default class NotificationMessage {
  static  notificationInstance;
  constructor(
    message = '',
    {
      duration = 0,
      type = ''} = {}
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.element = document.getElementsByClassName('notification')[0] || null;
    if (this.element) {
      this.destroy();
    }
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${Math.floor(this.duration / 1000)}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  show(container = document.body) {
    if (NotificationMessage.notificationInstance) {
      NotificationMessage.notificationInstance.remove();
    }

    NotificationMessage.notificationInstance = this.element;
    container.append(this.element);
    this.startTimer();
  }

  startTimer() {
    this.timer = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    clearTimeout(this.timer);
  }
}
