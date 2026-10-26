#!/usr/bin/env bash
# Descarga las fotos de Shopify a la carpeta del proyecto.
# Ejecútalo UNA vez desde la Terminal del Mac, antes de cancelar Shopify:
#   cd ~/Documents/aurora-femme && bash scripts/descargar-imagenes.sh
set -euo pipefail
cd "$(dirname "$0")/.."
CDN="https://cdn.shopify.com/s/files/1/0710/6838/5514/files"
mkdir -p assets/img/productos assets/img/colecciones

bajar() { echo "→ $2"; curl -fsSL "$1" -o "$2"; }

bajar "$CDN/hg008-uva-2048.jpg"              assets/img/productos/hg008-uva.jpg
bajar "$CDN/hg007-palo-de-rosa-2048.jpg"     assets/img/productos/hg007-palo-de-rosa.jpg
bajar "$CDN/hg006-negro-2048.jpg"            assets/img/productos/hg006-negro.jpg
bajar "$CDN/hg005-gris-tormenta-2048.jpg"    assets/img/productos/hg005-gris-tormenta.jpg
bajar "$CDN/hg004-oceano-profundo-01.jpg"    assets/img/productos/hg004-oceano-profundo.jpg
bajar "$CDN/hg003-frambuesa-01.png"          assets/img/productos/hg003-frambuesa.png
bajar "$CDN/hg002-mauve-2048.jpg"            assets/img/productos/hg002-mauve.jpg
bajar "$CDN/hg001-arena-2048.jpg"            assets/img/productos/hg001-arena.jpg
bajar "$CDN/pi001-champagne-01.jpg"          assets/img/productos/pi001-champagne.jpg
bajar "$CDN/pi002-duna-01.jpg"               assets/img/productos/pi002-duna.jpg
bajar "$CDN/pi003-avellana-01.jpg"           assets/img/productos/pi003-avellana.jpg
bajar "$CDN/pi004-chocolate-01.jpg"          assets/img/productos/pi004-chocolate.jpg
bajar "$CDN/pi005-negro-01.jpg"              assets/img/productos/pi005-negro.jpg
bajar "https://cdn.shopify.com/s/files/1/0710/6838/5514/collections/Hilos_Graduables.jpg?width=1500"   assets/img/colecciones/hilos-graduables.jpg
bajar "https://cdn.shopify.com/s/files/1/0710/6838/5514/collections/PANTIESINVISIBLES.jpg?width=1500"  assets/img/colecciones/panties-invisibles.jpg
bajar "https://cdn.shopify.com/s/files/1/0710/6838/5514/files/2aa5262b-2887-42d2-a589-e285c5002880-removebg-preview.png?width=560" assets/img/logo-aurora-femme.png

echo "Listo. Ahora sube las fotos: git add assets/img && git commit -m 'Fotos locales' && git push"
