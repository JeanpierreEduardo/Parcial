import {cargarSelector} from '../catalogo/catalogo.js';
import {exigirSesion,obtenerPerfil} from '../auth/auth.js';
import {api} from '../config/neon-config.js';
const form=document.getElementById('form-compra'),msg=document.getElementById('mensaje');
const id=Number(new URLSearchParams(location.search).get('id'));
if(exigirSesion()){try{await obtenerPerfil();if(!Number.isInteger(id)||id<1)throw Error('Selecciona una compra desde Mis compras.');const r=await api('/compras/'+id);if(r.estado!=='registrado')throw Error('Esta compra ya fue atendida o cancelada y no puede modificarse.');await cargarSelector(form.elements.pelicula,r);for(const k of ['pelicula','horario','cantidad','comentario'])form.elements[k].value=r[k]??'';form.hidden=false;msg.textContent='Código: '+r.codigo_seguimiento;}catch(e){msg.textContent=e.message}}
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const b=form.querySelector('button');b.disabled=true;try{await api('/compras/'+id,{method:'PUT',body:JSON.stringify(Object.fromEntries(new FormData(form)))});location.replace('consulta.html')}catch(e){msg.textContent=e.message}finally{b.disabled=false}});
