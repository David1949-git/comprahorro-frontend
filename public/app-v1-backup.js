document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('btnBuscar');
    const input = document.getElementById('prodInput');
    const lista = document.getElementById('lista-ahorros');
    const API_LOCAL  = 'http://localhost:10000/ahorros/buscar';
    const API_RENDER = 'http://localhost:10000/ahorros/buscar';

    function mostrarSpinner(termino) {
        lista.innerHTML = '<div class="p-8 text-center text-gray-500"><div class="inline-block w-6 h-6 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div><p class="text-sm">Buscando en Panamá: <b>' + termino + '</b>...</p></div>';
    }

    function mostrarError(msg) {
        lista.innerHTML = '<div class="p-6 text-center"><p class="text-red-500 font-bold text-sm mb-1">No se pudo completar la busqueda</p><p class="text-gray-400 text-xs">' + msg + '</p></div>';
    }

    function mostrarBotonInternacional(termino) {
        const urlIA = 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(termino) + '&gl=us&hl=es';
        return '<div class="p-4 border-t border-gray-100 mt-2 text-center"><p class="text-xs text-gray-400 mb-3">¿No encontraste lo que buscas en Panamá?</p><a href="' + urlIA + '" target="_blank" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-sm">🌐 Buscar Internacionalmente</a></div>';
    }

    function colorCategoria(categoria) {
        if (!categoria) return 'bg-gray-100 text-gray-500';
        const c = categoria.toLowerCase();
        if (c.includes('repuesto') || c.includes('auto')) return 'bg-orange-100 text-orange-700';
        if (c.includes('farmacia') || c.includes('salud')) return 'bg-red-100 text-red-700';
        if (c.includes('super') || c.includes('aliment')) return 'bg-green-100 text-green-700';
        if (c.includes('electr')) return 'bg-blue-100 text-blue-700';
        if (c.includes('ropa') || c.includes('moda') || c.includes('deporte')) return 'bg-pink-100 text-pink-700';
        if (c.includes('ferret') || c.includes('construc')) return 'bg-yellow-100 text-yellow-700';
        if (c.includes('mueble')) return 'bg-purple-100 text-purple-700';
        return 'bg-indigo-100 text-indigo-700';
    }

    function limpiarTitulo(titulo) {
        if (!titulo) return '';
        return titulo.replace(/ \| PriceSmart.*$/i, '').replace(/ \| Pagina.*$/i, '').replace(/ \| Panama.*$/i, '').trim();
    }

    function tarjetaProducto(item) {
        const tieneImagen = item.imagen && item.imagen.trim() !== '';
        const tienetelefono = item.telefono && item.telefono.trim() !== '';
        const tieneDireccion = item.direccion && item.direccion.trim() !== '';
        const tieneHorario = item.horario && item.horario.trim() !== '';
        const tieneCategoria = item.categoria && item.categoria.trim() !== '';
        const telLimpio = tienetelefono ? item.telefono.replace(/\D/g, '') : '';
        const linkHref = item.link && item.link.trim() !== '' ? item.link : '#';
        const titulo = limpiarTitulo(item.producto);
        const categoriaBadge = tieneCategoria
            ? '<span class="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold ' + colorCategoria(item.categoria) + '">' + item.categoria + '</span>'
            : '';

        // ── IMAGEN zona superior ──────────────────────────────────────
        const zonaImagen = tieneImagen
            ? '<div class="w-full h-28 bg-gray-50 flex items-center justify-center overflow-hidden relative">'
              + '<img src="' + item.imagen + '" class="w-full h-full object-contain p-2">'
              + '<span class="absolute bottom-1 right-1 text-[10px] font-bold text-gray-300 opacity-70">🐷 ComprAhorro</span>'
              + '</div>'
            : '<div class="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-between px-3">'
              + '<span class="text-white font-extrabold text-xs truncate flex-grow">' + item.tienda + '</span>'
              + '<span class="text-white text-xs opacity-60 ml-1">🐷</span>'
              + '</div>';

        // ── HEADER tienda (solo para tarjetas CON imagen) ─────────────
        const headerTienda = tieneImagen
            ? '<div class="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-500">'
              + '<span class="text-white font-extrabold text-xs truncate">' + item.tienda + '</span>'
              + categoriaBadge
              + '</div>'
            : '<div class="flex items-center gap-1 px-3 py-1 bg-indigo-50">' + categoriaBadge + '</div>';

        // ── BOTONES ───────────────────────────────────────────────────
        const botones = '<div class="flex gap-1 mt-auto pt-2">'
            + (tienetelefono ? '<a href="tel:+507' + telLimpio + '" class="flex-1 text-center text-[10px] font-bold py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">📞 Llamar</a>' : '')
            + (tienetelefono ? '<a href="https://wa.me/507' + telLimpio + '" target="_blank" class="flex-1 text-center text-[10px] font-bold py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">💬 WA</a>' : '')
            + (linkHref !== '#' ? '<a href="' + linkHref + '" target="_blank" class="flex-1 text-center text-[10px] font-bold py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">🌐 Ver</a>' : '')
            + '</div>';

        return '<div class="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">'
            + zonaImagen
            + headerTienda
            + '<div class="p-3 flex flex-col flex-grow">'
            + '<p class="text-xs font-semibold text-gray-800 leading-tight mb-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + titulo + '</p>'
            + '<p class="text-sm font-extrabold text-green-700 mb-1">' + item.precioFinal + '</p>'
            + (tieneDireccion ? '<p class="text-[10px] text-gray-500 mb-1">📍 ' + item.direccion + '</p>' : '')
            + (tieneHorario ? '<p class="text-[10px] text-gray-400 mb-1">🕐 ' + item.horario + '</p>' : '')
            + botones
            + '</div></div>';
    }

    function mostrarResultados(resultados, termino) {
        if (!resultados || resultados.length === 0) {
            lista.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">No se encontraron ofertas locales.</div>' + mostrarBotonInternacional(termino);
            return;
        }
        let html = '<div class="grid grid-cols-2 gap-3 p-3">';
        resultados.forEach(item => { html += tarjetaProducto(item); });
        html += '</div>';
        html += mostrarBotonInternacional(termino);
        lista.innerHTML = html;
    }

    async function buscarEnTiendas(termino, lat, lon) {
        if (!lista) return;
        mostrarSpinner(termino);
        try {
            const res = await fetch(API_LOCAL + '?q=' + encodeURIComponent(termino) + (lat ? '&lat=' + lat + '&lon=' + lon : ''), { signal: AbortSignal.timeout(30000) });
            if (res.ok) { const data = await res.json(); mostrarResultados(data.resultados, termino); return; }
        } catch (e) { console.warn('Local no disponible', e.message); }
        try {
            const res = await fetch(API_RENDER + '?q=' + encodeURIComponent(termino) + (lat ? '&lat=' + lat + '&lon=' + lon : ''), { signal: AbortSignal.timeout(30000) });
            if (res.ok) { const data = await res.json(); mostrarResultados(data.resultados, termino); return; }
            mostrarError('El servidor respondio con error.');
        } catch (e) { mostrarError('No hay conexion con el servidor local ni con la nube.'); }
    }

    boton.addEventListener('click', () => {
        const producto = input.value.trim();
        if (!producto) {
            input.classList.add('ring-2', 'ring-red-400');
            input.placeholder = 'Escribe un producto primero!';
            setTimeout(() => { input.classList.remove('ring-2','ring-red-400'); input.placeholder = '¿Qué quieres BUSCAR hoy?'; }, 2000);
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => buscarEnTiendas(producto, pos.coords.latitude, pos.coords.longitude),
                ()  => buscarEnTiendas(producto, null, null),
                { timeout: 5000 }
            );
        } else { buscarEnTiendas(producto, null, null); }
    });

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') boton.click(); });
});
