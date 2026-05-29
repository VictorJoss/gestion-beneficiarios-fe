<template>
  <div class="dash">
    <header class="hero">
      <div>
        <p class="eyebrow">Panel principal</p>
        <h1>Bienvenido, {{ usuario?.correo || 'Usuario' }}</h1>
        <p class="hero-copy">Tu sesión está activa y el acceso a la API queda centralizado desde el código.</p>
      </div>
      <button class="logout" @click="logout">Cerrar sesión</button>
    </header>

    <section class="grid">
      <article class="card stat">
        <span class="stat-label">Estado de sesión</span>
        <strong>{{ token ? 'Activa' : 'Sin token' }}</strong>
      </article>

      <article class="card action">
        <div class="action-head">
          <div>
            <span class="section-label">Prueba rápida</span>
            <h3>Consulta al backend</h3>
          </div>
        </div>
        <p class="action-copy">Ejecuta una llamada de lectura usando el cliente centralizado.</p>
        <button class="primary" @click="callSample">Probar llamada a usuarios</button>
      </article>
    </section>

    <section class="card result" v-if="apiResult">
      <div class="result-head">
        <span class="section-label">Respuesta</span>
      </div>
      <pre>{{ apiResult }}</pre>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import api from '../services/api'

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const token = ref<string | null>(localStorage.getItem('access_token'))
    const usuario = ref<any>(JSON.parse(localStorage.getItem('usuario') || 'null'))
    const apiResult = ref<string | null>(null)

    const logout = () => {
      localStorage.removeItem('access_token')
      window.location.href = '/'
    }

    const callSample = async () => {
      apiResult.value = 'Cargando...'
      try {
        const resp = await api.get('/users/?skip=0&limit=10')
        apiResult.value = JSON.stringify(resp.data, null, 2)
      } catch (err: any) {
        apiResult.value = 'Error al llamar API: ' + (err.response?.status || err.message)
      }
    }

    return { token, usuario, apiResult, logout, callSample }
  }
})
</script>

<style scoped>
.dash{min-height:100vh;padding:28px;background:linear-gradient(180deg,#f6f8fc 0%,#eef3ff 100%);font-family:system-ui}
.hero{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin:0 auto 24px;max-width:1100px}
.eyebrow,.section-label{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#eaf2ff;color:#2b5fd9;font-size:12px;font-weight:700}
h1{margin:12px 0 10px;font-size:34px;line-height:1.05;color:#101828}
.hero-copy{margin:0;color:#667085;max-width:620px;font-size:15px}
.logout,.primary{border:0;border-radius:14px;padding:12px 16px;font-weight:700;cursor:pointer;transition:transform .15s ease, box-shadow .15s ease}
.logout{background:#fff;color:#344054;box-shadow:0 10px 24px rgba(16,24,40,.08);border:1px solid #eaecf0}
.primary{background:linear-gradient(135deg,#2b7cff,#5d8cff);color:#fff;box-shadow:0 14px 24px rgba(43,124,255,.22)}
.logout:hover,.primary:hover{transform:translateY(-1px)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:1100px;margin:0 auto}
.card{background:rgba(255,255,255,.88);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.8);border-radius:24px;box-shadow:0 18px 50px rgba(16,24,40,.10);padding:24px}
.stat{display:flex;flex-direction:column;justify-content:space-between;min-height:160px}
.stat-label{font-size:13px;color:#667085;font-weight:700}
.stat strong{font-size:28px;color:#101828}
.action-head h3{margin:10px 0 0;font-size:22px;color:#101828}
.action-copy{margin:12px 0 20px;color:#667085;line-height:1.6}
.result{max-width:1100px;margin:18px auto 0}
pre{white-space:pre-wrap;background:#0f172a;color:#e2e8f0;padding:18px;border-radius:18px;overflow:auto;margin:0;font-size:13px;line-height:1.6}
@media (max-width: 760px){
  .hero,.grid{grid-template-columns:1fr;display:grid}
  .hero{align-items:stretch}
  .grid{grid-template-columns:1fr}
}
</style>
