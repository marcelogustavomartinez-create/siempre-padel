/* =========================================================
   Siempre Pádel - script.js
   Maneja toda la interactividad del sitio:
   - Carga de productos desde la API REST con fetch
   - Carrito de compras guardado en localStorage
   - Validación y envío del formulario de contacto
   Se usa el mismo archivo en todas las páginas: cada parte
   se ejecuta solo si encuentra sus elementos en el HTML.
   ========================================================= */


/* ---------- Configuración ---------- */

// Carpeta raíz del sitio: "." en index.html y ".." en las páginas de /pages
const RAIZ = document.body.dataset.raiz || ".";

// API REST armada con My JSON Server a partir del archivo db.json del repositorio
const API_URL = "https://my-json-server.typicode.com/marcelogustavomartinez-create/siempre-padel/productos";

// Si la API no responde, se usa la copia local del mismo archivo
const API_LOCAL = `${RAIZ}/db.json`;

// Tiempo máximo que se espera a la API antes de usar la copia local (en milisegundos)
const TIEMPO_ESPERA_API = 5000;

const CLAVE_CARRITO = "carritoSiemprePadel";
const CANTIDAD_MAXIMA = 10;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Productos traídos de la API (se guardan para filtrar y ordenar sin volver a pedirlos)
let productos = [];


/* ---------- Utilidades ---------- */

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

function formatearPrecio(valor) {
    return formatoPrecio.format(valor);
}

// Crea la zona de avisos al cargar la página. Tiene que existir desde el principio
// para que los lectores de pantalla anuncien los mensajes que se agregan después.
function crearZonaMensajes() {
    const contenedor = document.createElement("div");
    contenedor.className = "mensajes";
    contenedor.setAttribute("role", "status");
    contenedor.setAttribute("aria-live", "polite");
    document.body.appendChild(contenedor);
}

// Muestra un aviso abajo a la derecha que desaparece solo
function mostrarMensaje(texto, tipo = "ok") {
    const contenedor = document.querySelector(".mensajes");
    const mensaje = document.createElement("p");
    mensaje.className = tipo === "error" ? "mensaje mensaje-error" : "mensaje";
    mensaje.textContent = texto;
    contenedor.appendChild(mensaje);

    setTimeout(() => mensaje.remove(), 3500);
}


/* =========================================================
   PRODUCTOS (fetch a la API)
   ========================================================= */

async function obtenerProductos() {
    try {
        // Si la API tarda demasiado se corta el pedido y se pasa a la copia local
        const respuesta = await fetch(API_URL, { signal: AbortSignal.timeout(TIEMPO_ESPERA_API) });

        if (!respuesta.ok) {
            throw new Error("La API respondió con el estado " + respuesta.status);
        }

        return await respuesta.json();
    } catch (error) {
        console.warn("No se pudo usar la API, se cargan los productos locales.", error);

        const respuesta = await fetch(API_LOCAL);
        const datos = await respuesta.json();
        return datos.productos;
    }
}

// Arma la card de un producto con imagen, título, precio y botón
function crearCard(producto) {
    const card = document.createElement("article");
    card.className = "card producto";

    card.innerHTML = `
        <img src="${RAIZ}/${producto.imagen}" class="card-img-top" alt="${producto.alt}" width="400" height="300" loading="lazy">
        <div class="card-body producto-cuerpo">
            <span class="producto-etiqueta">${producto.tipo}</span>
            <h3 class="producto-titulo">${producto.titulo}</h3>
            <p class="producto-descripcion">${producto.descripcion}</p>
            <p class="producto-precio">${formatearPrecio(producto.precio)}</p>
            <button type="button" class="btn btn-cancha w-100" data-agregar="${producto.id}">
                Agregar<span class="visually-hidden"> ${producto.titulo}</span> al carrito
            </button>
        </div>
    `;

    return card;
}

function renderizarProductos(lista, contenedor) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="estado-carga">No encontramos productos con esa búsqueda.</p>';
        return;
    }

    lista.forEach((producto) => contenedor.appendChild(crearCard(producto)));
}

// Página de inicio: muestra solo los productos destacados
async function iniciarDestacados() {
    const contenedor = document.getElementById("lista-destacados");
    if (!contenedor) return;

    contenedor.setAttribute("aria-busy", "true");

    try {
        productos = await obtenerProductos();
        const destacados = productos.filter((producto) => producto.destacado);
        renderizarProductos(destacados, contenedor);
    } catch (error) {
        contenedor.innerHTML = '<p class="estado-carga">No pudimos cargar los productos. Probá recargar la página.</p>';
    }

    contenedor.removeAttribute("aria-busy");
}

// Página de productos: catálogo completo con filtros, búsqueda y orden
async function iniciarCatalogo() {
    const contenedor = document.getElementById("lista-productos");
    if (!contenedor) return;

    // Si se llega desde un link como productos.html?categoria=palas, se marca ese filtro
    const categoriaUrl = new URLSearchParams(window.location.search).get("categoria");
    if (categoriaUrl) {
        marcarFiltro(categoriaUrl);
    }

    contenedor.setAttribute("aria-busy", "true");

    try {
        productos = await obtenerProductos();
        aplicarFiltros();
    } catch (error) {
        contenedor.innerHTML = '<p class="estado-carga">No pudimos cargar los productos. Probá recargar la página.</p>';
    }

    contenedor.removeAttribute("aria-busy");

    document.querySelectorAll("[data-filtro]").forEach((boton) => {
        boton.addEventListener("click", () => {
            marcarFiltro(boton.dataset.filtro);
            aplicarFiltros();
        });
    });

    document.getElementById("buscar").addEventListener("input", aplicarFiltros);
    document.getElementById("orden").addEventListener("change", aplicarFiltros);
}

function marcarFiltro(filtro) {
    document.querySelectorAll("[data-filtro]").forEach((boton) => {
        boton.setAttribute("aria-pressed", boton.dataset.filtro === filtro);
    });
}

function aplicarFiltros() {
    const botonActivo = document.querySelector('[data-filtro][aria-pressed="true"]');
    const filtro = botonActivo ? botonActivo.dataset.filtro : "todos";
    const texto = document.getElementById("buscar").value.trim().toLowerCase();
    const orden = document.getElementById("orden").value;

    let lista = productos.filter((producto) => filtro === "todos" || producto.categoria === filtro);

    if (texto) {
        lista = lista.filter((producto) => producto.titulo.toLowerCase().includes(texto));
    }

    if (orden === "menor") {
        lista.sort((a, b) => a.precio - b.precio);
    } else if (orden === "mayor") {
        lista.sort((a, b) => b.precio - a.precio);
    }

    renderizarProductos(lista, document.getElementById("lista-productos"));

    const resultados = document.getElementById("cantidad-resultados");
    resultados.textContent = lista.length === 1 ? "1 producto" : `${lista.length} productos`;
}


/* =========================================================
   CARRITO (localStorage)
   ========================================================= */

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
    } catch (error) {
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarContador();
}

function contarProductos(carrito) {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function calcularTotal(carrito) {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

// Actualiza el número del carrito en el header de todas las páginas
function actualizarContador() {
    const cantidad = contarProductos(obtenerCarrito());

    document.querySelectorAll(".contador-carrito").forEach((contador) => {
        contador.textContent = cantidad;
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find((item) => item.id === id);
    if (!producto) return;

    const carrito = obtenerCarrito();
    const enCarrito = carrito.find((item) => item.id === id);

    if (enCarrito) {
        if (enCarrito.cantidad >= CANTIDAD_MAXIMA) {
            mostrarMensaje(`Podés llevar hasta ${CANTIDAD_MAXIMA} unidades de cada producto.`, "error");
            return;
        }
        enCarrito.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            titulo: producto.titulo,
            precio: producto.precio,
            imagen: producto.imagen,
            alt: producto.alt,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    mostrarMensaje(`Agregaste ${producto.titulo} al carrito.`);
}

function cambiarCantidad(id, cantidad) {
    const carrito = obtenerCarrito();
    const item = carrito.find((producto) => producto.id === id);
    if (!item) return;

    // La cantidad queda siempre entre 1 y el máximo permitido
    item.cantidad = Math.min(Math.max(cantidad, 1), CANTIDAD_MAXIMA);

    guardarCarrito(carrito);
    renderizarCarrito();
}

function eliminarDelCarrito(id) {
    const carrito = obtenerCarrito();
    const item = carrito.find((producto) => producto.id === id);

    guardarCarrito(carrito.filter((producto) => producto.id !== id));
    renderizarCarrito();

    if (item) {
        mostrarMensaje(`Quitaste ${item.titulo} del carrito.`);
    }
}

function vaciarCarrito() {
    guardarCarrito([]);
    renderizarCarrito();
}

// Página del carrito: lista de productos con cantidad, subtotal y total
function renderizarCarrito() {
    const lista = document.getElementById("carrito-items");
    if (!lista) return;

    const carrito = obtenerCarrito();
    const vacio = document.getElementById("carrito-vacio");
    const contenido = document.getElementById("carrito-contenido");

    vacio.hidden = carrito.length > 0;
    contenido.hidden = carrito.length === 0;

    lista.innerHTML = "";

    carrito.forEach((item) => {
        const fila = document.createElement("li");
        fila.className = "carrito-item";

        fila.innerHTML = `
            <img src="${RAIZ}/${item.imagen}" alt="${item.alt}" width="96" height="72">
            <div class="carrito-item-info">
                <h3>${item.titulo}</h3>
                <p>${formatearPrecio(item.precio)} c/u</p>
            </div>
            <div class="cantidad" role="group" aria-label="Cantidad de ${item.titulo}">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-accion="restar" data-id="${item.id}" aria-label="Restar una unidad de ${item.titulo}" ${item.cantidad <= 1 ? "disabled" : ""}>−</button>
                <input type="number" class="form-control form-control-sm" min="1" max="${CANTIDAD_MAXIMA}" value="${item.cantidad}" data-id="${item.id}" aria-label="Cantidad de ${item.titulo}">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-accion="sumar" data-id="${item.id}" aria-label="Sumar una unidad de ${item.titulo}" ${item.cantidad >= CANTIDAD_MAXIMA ? "disabled" : ""}>+</button>
            </div>
            <p class="carrito-item-subtotal">${formatearPrecio(item.precio * item.cantidad)}</p>
            <button type="button" class="btn btn-link text-danger p-0" data-accion="eliminar" data-id="${item.id}">
                Eliminar<span class="visually-hidden"> ${item.titulo}</span>
            </button>
        `;

        lista.appendChild(fila);
    });

    const cantidad = contarProductos(carrito);
    document.getElementById("carrito-cantidad").textContent = cantidad === 1 ? "1 producto" : `${cantidad} productos`;
    document.getElementById("carrito-total").textContent = formatearPrecio(calcularTotal(carrito));
}

function iniciarCarrito() {
    const lista = document.getElementById("carrito-items");
    if (!lista) return;

    renderizarCarrito();

    // Botones de restar, sumar y eliminar (un solo listener para toda la lista)
    lista.addEventListener("click", (evento) => {
        const boton = evento.target.closest("[data-accion]");
        if (!boton) return;

        const id = Number(boton.dataset.id);
        const accion = boton.dataset.accion;
        const item = obtenerCarrito().find((producto) => producto.id === id);
        if (!item) return;

        if (accion === "sumar") cambiarCantidad(id, item.cantidad + 1);
        if (accion === "restar") cambiarCantidad(id, item.cantidad - 1);
        if (accion === "eliminar") {
            eliminarDelCarrito(id);
            document.getElementById("titulo-carrito").focus();
            return;
        }

        // Después de redibujar la lista, el foco vuelve al mismo botón o al campo de cantidad
        const mismoBoton = lista.querySelector(`[data-accion="${accion}"][data-id="${id}"]:not([disabled])`);
        const campo = lista.querySelector(`input[data-id="${id}"]`);
        (mismoBoton || campo).focus();
    });

    // Cantidad escrita a mano en el campo
    lista.addEventListener("change", (evento) => {
        if (!evento.target.matches("input[data-id]")) return;

        const cantidad = parseInt(evento.target.value, 10);
        cambiarCantidad(Number(evento.target.dataset.id), isNaN(cantidad) ? 1 : cantidad);
    });

    document.getElementById("vaciar-carrito").addEventListener("click", () => {
        vaciarCarrito();
        mostrarMensaje("Vaciaste el carrito.");
        document.getElementById("titulo-carrito").focus();
    });

    // Al abrir la ventana de confirmación se completa el resumen de la compra
    document.getElementById("modal-compra").addEventListener("show.bs.modal", () => {
        const carrito = obtenerCarrito();
        document.getElementById("resumen-compra").innerHTML = carrito
            .map((item) => `<li>${item.cantidad} x ${item.titulo}: ${formatearPrecio(item.precio * item.cantidad)}</li>`)
            .join("");
        document.getElementById("resumen-total").textContent = formatearPrecio(calcularTotal(carrito));
    });

    document.getElementById("confirmar-compra").addEventListener("click", finalizarCompra);
}

// Simula la compra: genera un número de pedido y vacía el carrito
function finalizarCompra() {
    const numeroPedido = "SP-" + Date.now().toString().slice(-6);

    bootstrap.Modal.getInstance(document.getElementById("modal-compra")).hide();
    vaciarCarrito();

    document.getElementById("carrito-vacio").hidden = true;
    document.getElementById("numero-pedido").textContent = numeroPedido;

    const exito = document.getElementById("compra-exitosa");
    exito.hidden = false;
    exito.querySelector("h2").focus();
}


/* =========================================================
   FORMULARIO DE CONTACTO (validación + envío a Formspree)
   ========================================================= */

function validarCampo(campo) {
    const valor = campo.value.trim();
    let error = "";

    if (valor === "") {
        error = "Este campo es obligatorio.";
    } else if (campo.name === "nombre" && valor.length < 2) {
        error = "El nombre tiene que tener al menos 2 letras.";
    } else if (campo.type === "email" && !REGEX_EMAIL.test(valor)) {
        error = "Ingresá un correo válido, por ejemplo nombre@correo.com.";
    } else if (campo.name === "mensaje" && valor.length < 10) {
        error = "El mensaje tiene que tener al menos 10 caracteres.";
    }

    document.getElementById(`error-${campo.id}`).textContent = error;
    campo.classList.toggle("is-invalid", error !== "");
    campo.setAttribute("aria-invalid", error !== "");

    return error === "";
}

function validarFormulario(formulario) {
    const campos = formulario.querySelectorAll("[required]");
    let primerError = null;

    campos.forEach((campo) => {
        if (!validarCampo(campo) && !primerError) {
            primerError = campo;
        }
    });

    // El foco va al primer campo con error para corregirlo enseguida
    if (primerError) {
        primerError.focus();
    }

    return primerError === null;
}

function iniciarFormulario() {
    const formulario = document.getElementById("form-contacto");
    if (!formulario) return;

    const estado = document.getElementById("estado-formulario");
    const boton = formulario.querySelector("button[type='submit']");

    // Valida cada campo cuando el usuario sale de él
    formulario.querySelectorAll("[required]").forEach((campo) => {
        campo.addEventListener("blur", () => validarCampo(campo));
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        estado.className = "estado-formulario";
        estado.textContent = "";

        if (!validarFormulario(formulario)) return;

        boton.disabled = true;
        boton.textContent = "Enviando...";

        try {
            const respuesta = await fetch(formulario.action, {
                method: "POST",
                body: new FormData(formulario),
                headers: { Accept: "application/json" }
            });

            // Si Formspree no acepta el envío por fetch, el formulario se manda de la
            // forma tradicional (abre la página de Formspree) para no perder la consulta
            if (!respuesta.ok) {
                formulario.submit();
                return;
            }

            formulario.reset();
            estado.className = "estado-formulario alert alert-success";
            estado.textContent = "¡Gracias! Recibimos tu consulta y te respondemos en el día.";
        } catch (error) {
            estado.className = "estado-formulario alert alert-danger";
            estado.textContent = "No pudimos enviar tu consulta. Probá de nuevo en unos minutos.";
        }

        boton.disabled = false;
        boton.textContent = "Enviar consulta";
    });
}


/* =========================================================
   INICIO
   ========================================================= */

// Botones "Agregar al carrito" de cualquier página (las cards se crean después de cargar)
document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-agregar]");
    if (boton) {
        agregarAlCarrito(Number(boton.dataset.agregar));
    }
});

// Si el carrito cambia en otra pestaña, se actualiza también en esta
window.addEventListener("storage", (evento) => {
    if (evento.key === CLAVE_CARRITO) {
        actualizarContador();
        renderizarCarrito();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    crearZonaMensajes();
    actualizarContador();
    iniciarDestacados();
    iniciarCatalogo();
    iniciarCarrito();
    iniciarFormulario();

    const anio = document.getElementById("anio");
    if (anio) {
        anio.textContent = new Date().getFullYear();
    }
});
