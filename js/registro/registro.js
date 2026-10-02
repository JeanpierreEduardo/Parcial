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
    const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try {
      const booking = await guardarReserva({ pelicula: document.getElementById('pelicula').value, horario: time, cantidad: count, comentario: document.getElementById('comentario').value.trim().slice(0, 500) });
      showConfirmation(booking.codigo); form.reset(); name.value = perfil.nombre; email.value = perfil.correo;
    } catch (cause) { error.textContent = cause.message; } finally { button.disabled = false; }
  });
});
function showConfirmation(code) {
  const modal = document.createElement('div'); modal.className = 'confirmacion-modal';
  const card = document.createElement('div'); card.className = 'confirmacion-tarjeta';
  const title = document.createElement('h3'); title.textContent = 'Reserva registrada';
  const desc = document.createElement('p'); desc.textContent = 'Tu código de seguimiento es:';
  const value = document.createElement('strong'); value.textContent = code;
  const detail = document.createElement('p'); detail.textContent = 'Puedes verla en Mis reservas.';
  const accept = document.createElement('button'); accept.type = 'button'; accept.className = 'boton boton-primario'; accept.textContent = 'Aceptar';
  card.append(title, desc, value, detail, accept); modal.append(card); document.body.append(modal);
  requestAnimationFrame(() => modal.classList.add('visible')); accept.addEventListener('click', () => modal.remove());
}
