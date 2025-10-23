/**
 * PRESENTACIÓN: TablaRenderer
 * RESPONSABILIDAD ÚNICA: Renderizar tablas de datos matemáticos
 * RAZÓN PARA CAMBIAR: Solo si cambia cómo se presentan las tablas
 */
import type { Matriz } from "../entidades/Matriz"

export interface FilaTabla {
  celdas: (string | number)[]
  estilos?: string[]
}

export class TablaRenderer {
  // Renderizar matriz como HTML
  renderizarMatriz(matriz: Matriz): string {
    let html = '<table class="matriz-tabla">'

    for (let i = 0; i < matriz.filas; i++) {
      html += "<tr>"
      for (let j = 0; j < matriz.columnas; j++) {
        const valor = matriz.datos[i][j].toFixed(2)
        html += `<td>${valor}</td>`
      }
      html += "</tr>"
    }

    html += "</table>"
    return html
  }

  // Renderizar tabla genérica
  renderizarTabla(encabezados: string[], filas: FilaTabla[], titulo?: string): string {
    let html = '<div class="tabla-contenedor">'

    if (titulo) {
      html += `<h3 class="tabla-titulo">${titulo}</h3>`
    }

    html += '<table class="tabla-datos">'

    // Encabezados
    html += "<thead><tr>"
    encabezados.forEach((enc) => {
      html += `<th>${enc}</th>`
    })
    html += "</tr></thead>"

    // Filas
    html += "<tbody>"
    filas.forEach((fila) => {
      html += "<tr>"
      fila.celdas.forEach((celda, idx) => {
        const estilo = fila.estilos?.[idx] || ""
        html += `<td class="${estilo}">${celda}</td>`
      })
      html += "</tr>"
    })
    html += "</tbody>"

    html += "</table></div>"
    return html
  }

  // Renderizar pasos de operación
  renderizarPasos(pasos: string[], titulo = "Pasos"): string {
    let html = '<div class="pasos-contenedor">'
    html += `<h4 class="pasos-titulo">${titulo}</h4>`
    html += '<ol class="pasos-lista">'

    pasos.forEach((paso) => {
      html += `<li>${paso}</li>`
    })

    html += "</ol></div>"
    return html
  }
}
