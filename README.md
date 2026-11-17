# Siempre Pádel



Proyecto final del curso de Front End de Talento Tech.

## 

## De qué se trata

Siempre Pádel es una tienda online ficticia de pádel, el deporte que más juego. Vende palas y los
accesorios básicos: pelotas, overgrips, protectores, muñequeras y paleteros.

Es un sitio de varias páginas. Los productos se cargan desde una API REST, se pueden agregar al
carrito, cambiar las cantidades, eliminar y simular la compra. El carrito queda guardado en
`localStorage`, así que no se pierde al recargar o cerrar la página.

## 

## Links

* Sitio publicado: https://marcelogustavomartinez-create.github.io/siempre-padel/
* Repositorio: https://github.com/marcelogustavomartinez-create/siempre-padel
* API de productos: https://my-json-server.typicode.com/marcelogustavomartinez-create/siempre-padel/productos

## 

## Páginas

|Página|Ruta|Qué tiene|
|-|-|-|
|Inicio|`index.html`|Portada, categorías, productos destacados, cómo elegir la pala y reseñas|
|Productos|`pages/productos.html`|Catálogo completo con filtros por categoría, búsqueda y orden por precio|
|Carrito|`pages/carrito.html`|Productos agregados, cantidades, subtotales, total y confirmación de compra|
|Contacto|`pages/contacto.html`|Formulario conectado a Formspree, datos del showroom y mapa|

Las páginas de `pages/` usan rutas relativas con `../` para volver a la raíz (por ejemplo
`../index.html` o `../css/styles.css`). Desde el inicio, los links a las categorías pasan un parámetro
por la URL (`productos.html?categoria=palas`) que el catálogo usa para filtrar.

## 

## Funcionalidades

* Los productos se piden con `fetch` a una API REST. La API la arma My JSON Server a partir del
archivo `db.json` de este repositorio. Si tarda más de 5 segundos o no responde, se lee el mismo
archivo de forma local para que la página nunca quede vacía.
* Cada card muestra imagen, título, descripción, precio y el botón para agregar al carrito.
* El contador del carrito está en el header de todas las páginas y se actualiza apenas se agrega algo,
incluso si el sitio está abierto en otra pestaña.
* En el carrito se pueden cambiar las cantidades (de 1 a 10), eliminar productos o vaciarlo. El total
se recalcula con cada cambio y la compra se simula con un número de pedido.
* El formulario de contacto se valida con JavaScript (campos obligatorios y formato del correo), muestra
el error debajo de cada campo y se envía a Formspree sin salir de la página. Tiene un campo oculto
para frenar envíos de bots.
* Al agregar o quitar productos aparece un aviso abajo a la derecha.

## 

## Diseño

* HTML semántico: header, nav, main, section, article, aside y footer
* Bootstrap 5 para el menú desplegable, la grilla del carrito y la ventana de confirmación
* CSS propio en `css/styles.css`, con variables de colores y fuentes
* Google Fonts: Barlow Condensed y Barlow
* Flexbox con `flex-wrap` en las cards de productos y Grid en las reseñas
* Media queries para que el contacto, las reseñas y la portada se adapten a cada pantalla

Las imágenes de los productos son ilustraciones en SVG, para no depender de fotos con derechos de autor.

## 

## Accesibilidad y SEO

* Texto alternativo en todas las imágenes
* Enlace "Saltar al contenido" y foco visible para navegar con el teclado
* Los botones de cantidad y eliminar tienen textos que leen bien los lectores de pantalla
* Avisos con `aria-live` para que se anuncien los cambios del carrito y del formulario
* Título y meta descripción propios en cada página, etiquetas Open Graph, `robots.txt` y `sitemap.xml`

## 

## Estructura

```
siempre-padel/
├── index.html
├── db.json
├── README.md
├── robots.txt
├── sitemap.xml
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── pages/
│   ├── productos.html
│   ├── carrito.html
│   └── contacto.html
└── img/
    ├── favicon.svg
    ├── logo.svg
    ├── hero.svg
    └── productos/
```

## 

## Cómo verlo en local

Abrir la carpeta en VS Code y usar la extensión Live Server. Hace falta un servidor porque el
navegador no permite hacer `fetch` de archivos locales abriendo el HTML con doble clic.

## 

## Autor

Marcelo Martínez

