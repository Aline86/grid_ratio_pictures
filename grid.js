class GridConfig {
  constructor(options = {}) {
    this.baseHeight = options.baseHeight || 200;
    this.gap = options.gap || 10;
    this.containerSelector = options.containerSelector || ".container";
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
      this.dom.getAllPictures()
    );

    is_loaded.then(() => {
      this.dom.getContainer(this.config.containerSelector);
      const fichiers_images = this.dom.getAllPictures();
      this.calculate_grid(fichiers_images, this.config);

      if (this.resizeCleanup) {
        this.resizeCleanup();
      }

      this.resizeCleanup = this.eventManager.recalculate_on_resize(
        this.calculate_grid,
        this.config
      );

      if (!this.hasTriggered_loader) {
        this.dom.remove_loader();
        this.hasTriggered_loader = true;
      }
    });
  };

  pre_loading_pictures = () => {
    const images_data = JSON.parse(this.fichiers);
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
    const container_base_height = this.config.baseHeight;

    const surface_line = container_width * container_base_height;
    const gap = this.config.gap;
    let width_under = 0;

    let line = [];

    images.forEach((element) => {
      const rem = element.cloneNode();

      if (width_under + element.clientWidth >= container_width) {
        const new_height = this.calculate_grid_part.calculate_rest(
          width_under,
          surface_line,
          container_base_height
        );
        this.calculate_grid_part.adjust_children_height(
          line,
          element,
          new_height
        );

        this.dom.appendChildToLine(container, rem);
        line = [];
        width_under = 0;
      } else {
        this.dom.appendChildToLine(container, rem);
      }
      line.push(rem);
      width_under += element.clientWidth + gap;
      element.remove();
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

  recalculate_on_resize = (_func, config) => {
    let resizeTimer;
    console.log("toto");
    const handleResize = () => {
      clearTimeout(resizeTimer);

      document.querySelectorAll("img").forEach((element) => {
        element.style.setProperty("height", `${230}px`, "important");
      });
      resizeTimer = setTimeout(() => {
        _func(config);
      }, 800);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  };
}

class GridRenderParts {
  constructor() {
    this.document = document;
  }

  set_display_none = (line) => {
    line.style.opacity = "0";
  };

  create_loader = (config) => {
    const loader = this.document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = `Chargement...`;
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

  create_image = (images_data, config, image_counter) => {
    let img = this.document.createElement("img");
    img.src = "images/" + images_data[image_counter];
    img.style.height = `${config.baseHeight}px`;
    img.style.objectFit = "contain";
    return img;
  };

  remove_first_container = (line) => {
    if (line) {
      line.remove();
    }
  };

  appendLineToContainer = (line, selector) => {
    const container = this.document.querySelector(selector);
    if (container) {
      container.appendChild(line);
    }
  };

  appendChildToLine = (line, rem) => {
    if (line && rem) {
      line.appendChild(rem);
    }
  };

  create_line = (className) => {
    const line = this.document.createElement("div");
    line.classList.add(className);
    return line;
  };

  get_first_line = (i) => {
    return this.document.querySelectorAll(".line")[i];
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

  adjust_children_height(current_line, element, new_height) {
    if (!current_line || !element) return;

    for (let index = 0; index < current_line.length; index++) {
      const child = current_line[index];
      const newHeight = element.getBoundingClientRect().height + new_height;
      child.style.setProperty("height", `${newHeight}px`, "important");
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
