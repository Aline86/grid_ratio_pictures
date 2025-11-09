# Grille Dynamique d'Images (CSS/JS)

Ce projet propose une solution pour créer une grille dynamique d'images en utilisant uniquement du **CSS** et du **JavaScript**. La grille ajuste automatiquement la taille des images pour remplir chaque ligne, tout en respectant leur ratio original (largeur/hauteur).

L'approche est entièrement personnalisée et repose sur des calculs JavaScript pour positionner et redimensionner les vignettes afin d'assurer une disposition fluide et esthétique.

Le code est modulaire pour permettre l'extensibilité, le tests -- Les éléments du dom sont dissociés de la logique métier.

![Description de l'image](grid.png)

## Principe de fonctionnement

L'objectif du projet est de construire une grille flexible où chaque image :

1. **Maintient son ratio :** Chaque image conserve ses proportions originales, sans déformation.
2. **Remplie la ligne :** Les tailles des images sont calculées dynamiquement pour que chaque ligne de la grille soit complètement remplie.
3. **S'adapte à la taille de l'écran :** Le nombre d'images par ligne et leur taille s'ajustent en fonction de la largeur de la fenêtre.

## Fonctionnement détaillé

### 1. Calcul du positionnement et de la taille

Le JavaScript est utilisé pour calculer :

- **La taille optimale de chaque image** en fonction de la largeur totale de la grille et des images précédemment insérées.
- **Le positionnement des images** sur chaque ligne, en ajustant la largeur des vignettes afin qu'elles remplissent parfaitement avec une marge customisable.

### 2. Utilisation d'un conteneur flexible

La grille est gérée par un conteneur parent, qui contient toutes les images, avec des marges automatiques et des calculs pour répartir les images sur chaque ligne.

### 3. A venir prochainement : Réajustement lors du redimensionnement de la fenêtre

Lorsque la taille de la fenêtre change (par exemple, si l'utilisateur redimensionne son navigateur), le JavaScript recalcule les tailles des images et leur positionnement pour remplir à nouveau la grille de manière optimale.

## Fonctionnalités principales

- **Grille fluide et adaptative :** Le nombre d'images par ligne varie en fonction de la taille de la fenêtre, sans espaces vides.
- **Ajustement dynamique des tailles :** Les images sont redimensionnées en fonction de l'espace disponible.
- **Respect du ratio des images :** Les images sont redimensionnées tout en gardant leur ratio original, sans déformation.
- **A venir prochainement Recalculation à chaque redimensionnement :** La grille est automatiquement réajustée lors du redimensionnement de la fenêtre.

## Installation

### 1. Clonez ce dépôt

```bash
git clone https://github.com/Aline86/grid_ratio_pictures.git
```
