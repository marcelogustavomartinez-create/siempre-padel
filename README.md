# Siempre Pádel

Pre-entrega del proyecto del curso de Front End de Talento Tech.

## De qué se trata

Siempre Pádel es una tienda online ficticia de pádel, el deporte que más juego. Vende palas y los
accesorios básicos: pelotas, overgrips y paleteros.

La idea de la página es que cualquiera pueda ver el catálogo, entender qué pala le conviene
según su forma (redonda, lágrima o diamante), leer opiniones de otros jugadores y hacer una
consulta desde el formulario.

## Links

* Sitio publicado: https://marcelogustavomartinez-create.github.io/siempre-padel/
* Repositorio: https://github.com/marcelogustavomartinez-create/siempre-padel

## Secciones

* **Inicio:** portada con fondo degradado y una ilustración de una pala sobre la cancha.
* **Productos:** seis cards armadas con Flexbox que se acomodan según el ancho de la pantalla.
Cada una tiene una etiqueta con el tipo de producto (control, equilibrio, potencia o accesorio).
* **Reseñas:** grilla con CSS Grid. La reseña destacada ocupa todo el ancho en tablet y dos filas en escritorio.
* **Contacto:** formulario conectado a Formspree, datos del showroom y un mapa de Google Maps.
Con media queries el formulario y el mapa se apilan en celular y se ponen uno al lado del otro en pantallas grandes.

## Qué usé

* HTML semántico: header, nav, main, section y footer
* CSS en un archivo externo (`css/styles.css`)
* Google Fonts: Barlow Condensed y Barlow
* Flexbox, Grid y media queries
* Formspree para el formulario
* GitHub Pages para publicarlo

Las imágenes de los productos son ilustraciones en SVG, para no depender de fotos con derechos de autor.

## Estructura

```
siempre-padel/
├── index.html
├── README.md
├── css/
│   └── styles.css
└── img/
    ├── favicon.svg
    ├── logo.svg
    ├── hero.svg
    └── productos/
        ├── pala-control.svg
        ├── pala-hibrida.svg
        ├── pala-potencia.svg
        ├── pelotas.svg
        ├── overgrip.svg
        └── paletero.svg
```

## Autor

Marcelo Martínez

