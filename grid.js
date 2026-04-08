class GridConfig {
  constructor(options = {}) {
    this.baseHeight = options.baseHeight ?? 200;
    this.gap = options.gap ?? 10;
    this.containerSelector = options.containerSelector ?? ".container";
  }
}

class Grid {
  constructor(fichiers, config) {
    this.hasTriggered_loader = false;
    this.dom = new GridRenderParts();
    this.calculate_grid_part = new GridCalculateParts();
    this.imageLoader = new ImageLoader();
    this.config = config;
    this.eventManager = new EventManager();
    this.dom.set_css_on_grid(this.config);
    this.fichiers = fichiers;

    this.resizeCleanup = null;

    this.initialize();
  }

  initialize = () => {
    if (!this.hasTriggered_loader) {
      this.dom.create_loader(this.config);
    }

    this.pre_loading_pictures();

    const is_loaded = this.imageLoader.waitForAllImages(
      this.dom.getAllPictures(),
    );

    is_loaded.then(() => {
      this.dom.getContainer(this.config.containerSelector);
      const fichiers_images = this.dom.getAllPictures();
      this.calculate_grid(fichiers_images, this.config);

      if (this.resizeCleanup) {
        this.resizeCleanup();
      }
      const ua = navigator.userAgent;

      if (/mobile/i.test(ua) || /tablet|ipad|playbook|silk/i.test(ua)) {
        this.resizeCleanup = this.eventManager.recalculate_on_resize(
          this.calculate_grid,
          this.config,
          "change",
        );
      } else {
        this.resizeCleanup = this.eventManager.recalculate_on_resize(
          this.calculate_grid,
          this.config,
          "resize",
        );
      }

      if (!this.hasTriggered_loader) {
        this.dom.remove_loader();
        this.hasTriggered_loader = true;
      }
    });
  };

  pre_loading_pictures = () => {
    const images_data = this.fichiers;
    let image_counter = 0;

    const container = this.dom.getContainer(this.config.containerSelector);
    while (image_counter < images_data.length) {
      let img = this.dom.create_image(images_data, this.config, image_counter);
      this.dom.appendChildToLine(container, img);
      image_counter++;
    }
  };

  calculate_grid = () => {
    const images = this.dom.getAllPictures();

    const container = this.dom.getContainer(this.config.containerSelector);
    const container_width = container.clientWidth;
    const container_base_height = parseInt(this.config.baseHeight);
    const gap = parseInt(this.config.gap);
    let width_under = 0;
    let ratio = 0;
    let line = [];

    images.forEach((element) => {
      line.push(element);
      ratio += parseInt(element.naturalWidth) / parseInt(element.naturalHeight);
      width_under +=
        (parseInt(element.naturalWidth) / parseInt(element.naturalHeight)) *
          container_base_height +
        gap;
      if (line.length > 0 && width_under >= container_width) {
        const new_height = (container_width - line.length * gap) / ratio;

        this.calculate_grid_part.adjust_children_height(
          line,

          new_height,
        );

        line = [];
        width_under = 0;
        ratio = 0;
      }
    });
  };

  destroy = () => {
    if (this.resizeCleanup) {
      this.resizeCleanup();
    }

    this.dom = null;
    this.calculate_grid_part = null;
    this.imageLoader = null;
    this.eventManager = null;
  };
}

class EventManager {
  constructor() {}

  recalculate_on_resize = (_func, config, event) => {
    const mq = window.matchMedia("(orientation: portrait)");
    const handleResize = () => {
      _func(config);
    };
    if (event === "resize") {
      window.addEventListener(event, handleResize);
    } else {
      mq.addEventListener(event, handleResize);
    }

    return () => {
      if (event === "resize") {
        window.removeEventListener("resize", handleResize);
      } else {
        mq.removeEventListener("change", handleResize);
      }
    };
  };
}

class GridRenderParts {
  constructor() {
    this.document = document;
  }

  create_loader = (config) => {
    const loader = this.document.createElement("div");
    loader.className = "loader";
    this.getContainer(config.containerSelector).appendChild(loader);
    return loader;
  };

  remove_loader = () => {
    this.document.querySelector(".loader")?.remove();
  };

  set_css_on_grid = (options) => {
    const container = this.document.querySelector(options.containerSelector);
    if (container) {
      container.style.gap = `${options.gap}px`;
    }
  };
  set_css_on_last_image = (options) => {
    const container = this.document.querySelector(options.containerSelector);
    if (container) {
      container.classList.add("last_image_full_width");
    }
  };
  create_image = (images_data, config, image_counter) => {
    let img = this.document.createElement("img");
    img.src = images_data[image_counter];
    img.style.height = `${config.baseHeight}px`;
    img.style.objectFit = "contain";
    return img;
  };

  appendChildToLine = (line, rem) => {
    if (line && rem) {
      line.appendChild(rem);
    }
  };

  getAllPictures = () => {
    return this.document.querySelectorAll("img");
  };

  getContainer = (containerSelector) => {
    return this.document.querySelector(containerSelector);
  };
}

class GridCalculateParts {
  constructor() {}

  calculate_rest(line_width, surface_line, container_base_height) {
    const height = surface_line / line_width - container_base_height;

    return height;
  }

  adjust_children_height(current_line, new_height) {
    if (!current_line) return;

    for (let index = 0; index < current_line.length; index++) {
      const child = current_line[index];

      child.style.setProperty("height", `${new_height}px`);
    }
  }
}

class ImageLoader {
  constructor() {}

  async waitForAllImages(images) {
    const promises = Array.from(images).map((img) => this.waitForImage(img));
    return Promise.all(promises);
  }

  waitForImage(img) {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve(img);
      } else {
        const loadHandler = () => {
          cleanup();
          resolve(img);
        };

        const errorHandler = () => {
          console.log(`L'image ${img.src} n'a pas chargé.`);
          cleanup();
          resolve(img);
        };

        const cleanup = () => {
          img.removeEventListener("load", loadHandler);
          img.removeEventListener("error", errorHandler);
        };

        img.addEventListener("load", loadHandler);
        img.addEventListener("error", errorHandler);
      }
    });
  }
}
