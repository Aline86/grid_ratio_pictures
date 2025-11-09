<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="grid.js"></script>
    <link rel="stylesheet" href="style.css" />
    <title>Document</title>
  </head>
  <body>
    <div class="container">
      <div class="left"></div>
      <div class="right"></div>
    </div>
    <script>
      <?php 
        $dossier = './images';
        $fichiers = scandir($dossier);
        $extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $images = [];
        foreach ($fichiers as $fichier) {
          $extension = strtolower(pathinfo($fichier, PATHINFO_EXTENSION));
          if (in_array($extension, $extensions)) {
              $images[] = $fichier;
          }
        }

      ?>
  
      const config = new GridConfig({
        baseHeight: 200,
        gap: 10,
        containerSelector: ".container",
      });
      const grid = new Grid('<?php echo json_encode($images); ?>', config);
    
    </script>
  </body>
</html>
