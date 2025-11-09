class GridConfig {
  constructor(options = {}) {
    this.baseHeight = options.baseHeight || 200;
    this.gap = options.gap || 10;
    this.containerSelector = options.containerSelector || ".container";
  }
}

class Grid {
  constructor(fichiers, config) {
    this.dom = new GridRenderParts();
    this.calculate_grid_part = new GridCalculateParts();
    this.imageLoader = new ImageLoader();
    this.config = config;
    this.dom.set_css_on_grid(this.config);

    this.initialize(fichiers);
  }
  initialize(fichiers) {
    this.pre_loading_pictures(fichiers);

    const is_loaded = this.imageLoader.waitForAllImages(
      this.dom.getAllPictures()
    );
    if (is_loaded != undefined) {
      is_loaded.then(() => {
        this.dom.getContainer(this.config);
        const fichiers_images = this.dom.getAllPictures();
        this.calculate_grid(fichiers_images, this.config);
      });
    }
  }
  // J'injecte les image dans le DOM pour initialiser les valeurs
  pre_loading_pictures = (fichiers) => {
    const images_data = JSON.parse(fichiers);

    const container_width = this.dom.getContainer(this.config).clientWidth;

    let counter_lines = 0;
    let image_counter = 0;
    let i = 0;
    let line = null;
    let img_lines = null;

    line = this.dom.create_line("line");
    while (image_counter < images_data.length) {
      line.style.width = `${container_width}px`;
      this.dom.appendLineToContainer(line, this.config.containerSelector);
      counter_lines++;
      img_lines = this.dom.get_first_line(i);

      let img = this.dom.create_image(images_data, this.config, image_counter);
      this.dom.appendChildToLine(img_lines, img);
      image_counter++;
    }
  };

  // Création des lignes et calcul des dimensions des images
  calculate_grid = (images) => {
    const container = this.dom.getContainer(this.config);
    const container_width = container.clientWidth;
    const container_base_height = this.config.baseHeight;
    const surface_line = container_width * container_base_height;

    let i = 0;

    const gap = this.config.gap;
    let width_under = 0;

    let line = this.dom.create_line("line_2");
    document.querySelector(this.config.containerSelector).appendChild(line);
    images.forEach((element) => {
      const rem = element.cloneNode();

      if (width_under + parseFloat(element.clientWidth, 2) >= container_width) {
        const current_line = line;

        const new_height = this.calculate_grid_part.calculate_rest(
          width_under,
          surface_line,
          container_base_height
        );
        this.calculate_grid_part.adjust_children_height(
          current_line,
          element,
          new_height
        );
        line = this.dom.create_line("line_2");
        this.dom.appendLineToContainer(line, this.config.containerSelector);
        this.dom.appendChildToLine(line, rem);
        width_under = 0;

        i++;
      } else {
        this.dom.appendChildToLine(line, rem);
        i++;
      }
      width_under += parseInt(parseFloat(element.clientWidth) + gap);
      element.remove();
    });

    this.dom.rename_last_line(this.config, line);
    this.dom.remove_first_container(container);
  };
}

class GridRenderParts {
  constructor() {
    this.document = document;
  }
  set_css_on_grid(options) {
    this.document.querySelector(
      options.containerSelector
    ).style.gap = `${options.gap}px`;
    this.document.querySelector(
      options.containerSelector
    ).style.display = `flex`;
    this.document.querySelector(
      options.containerSelector
    ).style.flexDirection = `column`;
  }
  create_image(images_data, config, image_counter) {
    let img = this.document.createElement("img");
    img.src = "images/" + images_data[image_counter];
    img.style.height = `${config.baseHeight}px`;
    img.style.objectFit = "contain";

    return img;
  }
  rename_last_line(config, last_line) {
    if (last_line.getBoundingClientRect().width > 400) {
      last_line.className = "line";
      last_line.style.gap = config.gap + "px";
      last_line.style.marginLeft = config.gap * 0.5 + "px";
    } else {
      last_line.querySelector("img").style.width = "calc(100% - 10px)";
      last_line.querySelector("img").style.height = "auto";
    }
  }

  remove_first_container(line) {
    line.firstElementChild.remove();
  }

  appendLineToContainer(line, selector) {
    this.document.querySelector(selector).appendChild(line);
  }
  appendChildToLine(line, rem) {
    line.appendChild(rem);
  }

  create_line = (className) => {
    const line = this.document.createElement("div");
    line.classList.add(className);
    return line;
  };

  get_first_line = (i) => {
    return this.document.querySelectorAll(".line")[i];
  };

  getAllPictures() {
    return this.document.querySelectorAll("img");
  }

  getContainer(config) {
    return this.document.querySelector(config.containerSelector);
  }
}

class GridCalculateParts {
  constructor() {}
  // Fonction qui calcule la heuteur des images de la lignes pour que la surface de ttes les images remplisse la ligne
  calculate_rest(line_width, surface_line, container_base_height) {
    const height = surface_line / line_width - container_base_height;

    return parseFloat(height.toFixed(2));
  }
  adjust_children_height(current_line, element, new_height) {
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
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", () => {
          console.log(
            `L'image avec la source ${img.src} a échoué à se charger.`
          );
          resolve(img);
        });
      }
    });
  }
}
