import {iniciarProceso,mostrarConfirmacion} from '../animaciones/compra.js';
import {cargarSelector} from '../catalogo/catalogo.js';
import { exigirSesion, obtenerSesion, obtenerPerfil, guardarReserva } from '../auth/auth.js';
const usuario = exigirSesion();
let peliculas=[];
document.addEventListener('DOMContentLoaded', async () => {
  if (!usuario) return;
  let perfil;
  try { perfil = await obtenerPerfil(); }
  catch (error) {
    if (!obtenerSesion()) { exigirSesion(); return; }
    document.getElementById('sesion-activa').textContent = error.message;
    return;
  }
  const form = document.querySelector('.formulario-reserva');
  document.getElementById('sesion-activa').textContent = `Sesión: ${perfil.nombre}`;
  const name = document.getElementById('nombre'), email = document.getElementById('correo');
  name.value = perfil.nombre; name.readOnly = true; email.value = perfil.correo; email.readOnly = true;
  try{peliculas=await cargarSelector(document.getElementById('pelicula'));}catch(e){document.getElementById('reserva-error').textContent=e.message;return;}
  const movie = new URLSearchParams(location.search).get('pelicula');
  if (peliculas.some(p=>p.clave===movie&&p.estado==='cartelera')) document.getElementById('pelicula').value = movie;
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!obtenerSesion()) { exigirSesion(); return; }
    if (!form.reportValidity()) return;
    const selection=peliculas.find(p=>p.clave===document.getElementById('pelicula').value&&p.estado==='cartelera');
    const count = Number(document.getElementById('entradas').value);
    const time = document.getElementById('horario').value;
    const error = document.getElementById('reserva-error'); error.textContent = '';
    if (!selection || !Number.isInteger(count) || count < 1 || count > 8 || !['tarde', 'noche'].includes(time)) { error.textContent = 'Selecciona una película, horario y entre 1 y 8 entradas.'; return; }
    const button = form.querySelector('[type="submit"]'); const terminar=iniciarProceso(form,button,'Reservando tu entrada…');
    try {
      const booking = await guardarReserva({ pelicula: document.getElementById('pelicula').value, horario: time, cantidad: count, comentario: document.getElementById('comentario').value.trim().slice(0, 500) });
      mostrarConfirmacion({titulo:'¡Reserva confirmada!',codigo:booking.codigo,detalle:'Tu reserva se guardó correctamente. Puedes consultarla en Mis compras.'}); form.reset(); name.value = perfil.nombre; email.value = perfil.correo;
    } catch (cause) { error.textContent = cause.message; } finally { terminar(); }
  });
});
