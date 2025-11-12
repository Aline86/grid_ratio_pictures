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
        this.initialize,
        this.dom.reinit,
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
    let line = this.dom.create_line("line");

    while (image_counter < images_data.length) {
      this.dom.appendLineToContainer(line, this.config.containerSelector);
      let img_lines = this.dom.get_first_line(0);
      let img = this.dom.create_image(images_data, this.config, image_counter);
      this.dom.appendChildToLine(img_lines, img);
      image_counter++;
    }
  };

  calculate_grid = (images) => {
    const container = this.dom.getContainer(this.config.containerSelector);
    const container_width = container.clientWidth;
    const container_base_height = this.config.baseHeight;
    const surface_line = container_width * container_base_height;
    const gap = this.config.gap;
    let width_under = 0;

    let line = this.dom.create_line("line_2");
    this.dom.appendLineToContainer(line, this.config.containerSelector);

    images.forEach((element) => {
      const rem = element.cloneNode();

      if (width_under + parseFloat(element.clientWidth, 2) >= container_width) {
        if (line.children.length === 1) {
          width_under -= gap * 0.5;
        }

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

        line = this.dom.create_line("line_2");
        this.dom.appendLineToContainer(line, this.config.containerSelector);
        this.dom.appendChildToLine(line, rem);
        width_under = 0;
      } else {
        this.dom.appendChildToLine(line, rem);
      }

      width_under += parseInt(parseFloat(element.clientWidth) + gap);
      element.remove();
    });

    this.dom.rename_last_line(this.config, line);
    this.dom.remove_first_container(this.dom.get_first_line(0));
  };

  destroy = () => {
    if (this.resizeCleanup) {
      this.resizeCleanup();
    }
    this.dom.reinit(this.config);
    this.dom = null;
    this.calculate_grid_part = null;
    this.imageLoader = null;
    this.eventManager = null;
  };
}

class EventManager {
  constructor() {}

  recalculate_on_resize = (_func, _reinit, config) => {
    let resizeTimer;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        _reinit(config);
        _func();
      }, 200);
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
      container.style.display = `flex`;
      container.style.flexDirection = `column`;
    }
  };

  create_image = (images_data, config, image_counter) => {
    let img = this.document.createElement("img");
    img.src = "images/" + images_data[image_counter];
    img.style.height = `${config.baseHeight}px`;
    img.style.objectFit = "contain";
    return img;
  };

  rename_last_line = (config, last_line) => {
    if (!last_line) return;

    if (last_line.getBoundingClientRect().width > 400) {
      last_line.className = "line";
      last_line.style.gap = config.gap + "px";
      last_line.style.marginLeft = config.gap * 0.5 + "px";
    } else {
      const img = last_line.querySelector("img");
      if (img) {
        img.style.width = "calc(100% - " + config.gap + "px)";
        img.style.height = "auto";
      }
    }
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

  reinit = (config) => {
    const container = this.document.querySelector(config.containerSelector);
    if (container) {
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
      container.innerHTML = "";
    }
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

    for (let index = 0; index < current_line.children.length; index++) {
      const child = current_line.children[index];
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
