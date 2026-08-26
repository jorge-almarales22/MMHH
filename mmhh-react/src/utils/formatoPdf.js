import { jsPDF } from 'jspdf';
import {
    FLOTAS, SOPORTE_OPCIONES, PRIORIDADES, SUPERINTENDENCIAS,
    COORDINADORES_LISTA, AREAS_ENTREGA, MAX_TRABAJOS_CLIENTE
} from '../constants';

/**
 * Formato en papel del registro de requerimiento.
 *
 * No todos los tecnicos tienen la app a mano cuando dejan una pieza en el
 * taller. Este PDF lleva exactamente los mismos campos que el formulario para
 * que lo diligencien a mano, lo firmen y el coordinador lo transcriba despues
 * sin tener que perseguir datos que faltaron.
 */

const A4 = { ancho: 210, alto: 297 };
const M = 12;                       /* margen */
const ANCHO = A4.ancho - M * 2;     /* 186 mm utiles */

const TINTA = [15, 23, 42];         /* slate-900 */
const SUAVE = [100, 116, 139];      /* slate-500 */
const LINEA = [203, 213, 225];      /* slate-300 */
const FONDO = [241, 245, 249];      /* slate-100 */

/** Casilla vacia para marcar con lapiz. */
const casilla = (doc, x, y, lado = 3.2) => {
    doc.setDrawColor(...SUAVE).setLineWidth(0.25).rect(x, y, lado, lado);
};

/**
 * Fila de opciones con casilla. Envuelve sola cuando se acaba el ancho, que es
 * lo que permite meter las 24 flotas sin recalcular nada a mano.
 */
const opciones = (doc, x, y, lista, { columnas = 4, salto = 5 } = {}) => {
    const paso = ANCHO / columnas;
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...TINTA);
    lista.forEach((op, i) => {
        const cx = x + (i % columnas) * paso;
        const cy = y + Math.floor(i / columnas) * salto;
        casilla(doc, cx, cy - 2.4);
        doc.text(String(op), cx + 4.6, cy, { maxWidth: paso - 6 });
    });
    return y + Math.ceil(lista.length / columnas) * salto;
};

/** Barra de seccion: numero, titulo y, si hace falta, una indicacion corta. */
const seccion = (doc, y, numero, titulo, nota) => {
    doc.setFillColor(...TINTA).rect(M, y, ANCHO, 6, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(255, 255, 255);
    doc.text(`${numero}.  ${titulo.toUpperCase()}`, M + 2.5, y + 4.1);
    if (nota) {
        doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(203, 213, 225);
        doc.text(nota, A4.ancho - M - 2.5, y + 4.1, { align: 'right' });
    }
    return y + 6 + 4;
};

/** Campo escrito a mano: rotulo pequeno encima de una linea de escritura. */
const campo = (doc, x, y, w, label, { alto = 7 } = {}) => {
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text(label.toUpperCase(), x, y);
    doc.setDrawColor(...LINEA).setLineWidth(0.3).line(x, y + alto, x + w, y + alto);
    return y + alto;
};

/** Reglones en blanco para texto libre. */
const renglones = (doc, x, y, w, cantidad, paso = 7) => {
    doc.setDrawColor(...LINEA).setLineWidth(0.3);
    for (let i = 0; i < cantidad; i++) doc.line(x, y + i * paso, x + w, y + i * paso);
    return y + (cantidad - 1) * paso;
};

/** Casillas separadas, una por caracter: la OT son ocho, ni siete ni nueve. */
const casillero = (doc, x, y, cantidad, lado = 6) => {
    doc.setDrawColor(...SUAVE).setLineWidth(0.3);
    for (let i = 0; i < cantidad; i++) doc.rect(x + i * (lado + 1.2), y, lado, lado);
    return y + lado;
};

const encabezado = (doc) => {
    doc.setFillColor(...TINTA).rect(0, 0, A4.ancho, 22, 'F');
    doc.setFillColor(250, 204, 21).rect(0, 22, A4.ancho, 1.2, 'F');

    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(255, 255, 255);
    doc.text('REGISTRO DE REQUERIMIENTO', M, 11);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(203, 213, 225);
    doc.text('Cerrejon SGIA  ·  Maquinas y Herramientas  ·  Diligenciar a mano y entregar al coordinador', M, 16.5);

    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(203, 213, 225);
    doc.text('N.o DE SOLICITUD', A4.ancho - M, 8, { align: 'right' });
    doc.setDrawColor(148, 163, 184).setLineWidth(0.3);
    doc.line(A4.ancho - M - 32, 13.5, A4.ancho - M, 13.5);
    doc.setFontSize(5.6).setTextColor(148, 163, 184);
    doc.text('Lo asigna la app al transcribirlo', A4.ancho - M, 17.5, { align: 'right' });

    return 30;
};

const pie = (doc, pagina, total) => {
    doc.setDrawColor(...LINEA).setLineWidth(0.3).line(M, A4.alto - 12, A4.ancho - M, A4.alto - 12);
    doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(...SUAVE);
    doc.text('MMHH-FR-01  ·  Formato de registro de requerimiento  ·  Uso interno', M, A4.alto - 8);
    doc.text(`Pagina ${pagina} de ${total}`, A4.ancho - M, A4.alto - 8, { align: 'right' });
};

export const generarFormatoPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    /* ---------------- Pagina 1 ---------------- */
    let y = encabezado(doc);

    y = seccion(doc, y, 1, 'Orden de trabajo');
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('OT (8 CARACTERES)', M, y);
    casillero(doc, M, y + 1.5, 8);
    campo(doc, M + 70, y, 40, 'Fecha de entrega de la pieza');
    campo(doc, M + 118, y, 25, 'Cantidad');
    y += 12;

    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('FLOTA (MARCAR UNA)', M, y);
    y = opciones(doc, M, y + 5, FLOTAS, { columnas: 6 }) + 2;

    y = seccion(doc, y, 2, 'Trabajos requeridos', `Maximo ${MAX_TRABAJOS_CLIENTE}. Un solo tipo por fila`);
    const colNum = 10, colSop = 68, FILA = 10.5;
    doc.setFillColor(...FONDO).rect(M, y, ANCHO, 6, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('#', M + 3, y + 4);
    doc.text('SOPORTE', M + colNum + 2, y + 4);
    doc.text('TIPO DE REQUERIMIENTO', M + colNum + colSop + 2, y + 4);
    doc.setDrawColor(...LINEA).setLineWidth(0.3);
    for (let i = 0; i <= MAX_TRABAJOS_CLIENTE; i++) doc.line(M, y + 6 + i * FILA, M + ANCHO, y + 6 + i * FILA);
    doc.line(M, y, M, y + 6 + MAX_TRABAJOS_CLIENTE * FILA);
    doc.line(M + colNum, y, M + colNum, y + 6 + MAX_TRABAJOS_CLIENTE * FILA);
    doc.line(M + colNum + colSop, y, M + colNum + colSop, y + 6 + MAX_TRABAJOS_CLIENTE * FILA);
    doc.line(M + ANCHO, y, M + ANCHO, y + 6 + MAX_TRABAJOS_CLIENTE * FILA);
    doc.line(M, y, M + ANCHO, y);
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...SUAVE);
    for (let i = 0; i < MAX_TRABAJOS_CLIENTE; i++) doc.text(String(i + 1), M + 3.5, y + 6 + i * FILA + 5.8);
    y += 6 + MAX_TRABAJOS_CLIENTE * FILA + 3;

    doc.setFont('helvetica', 'italic').setFontSize(6).setTextColor(...SUAVE);
    doc.text('Categorias validas: ' + Object.keys(SOPORTE_OPCIONES).join('  ·  '), M, y, { maxWidth: ANCHO });
    y += 7;

    y = seccion(doc, y, 3, 'La pieza');
    campo(doc, M, y, 110, 'Nombre del componente');
    campo(doc, M + 118, y, 32, 'Part number');
    campo(doc, M + 156, y, 30, 'Stock code');
    y += 12;
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('QUE HAY QUE HACERLE  (sintoma observado, alcance esperado, condiciones de manejo)', M, y);
    y = renglones(doc, M, y + 7, ANCHO, 5) + 6;

    y = seccion(doc, y, 4, 'Prioridad', 'Marcar una: fija el plazo que se le exige al taller');
    y = opciones(doc, M, y + 1, Object.keys(PRIORIDADES).map(p => `${p} (${PRIORIDADES[p]} d)`), { columnas: 5 }) + 2;

    pie(doc, 1, 2);

    /* ---------------- Pagina 2 ---------------- */
    doc.addPage();
    y = encabezado(doc);

    y = seccion(doc, y, 5, 'Quien solicita', 'Datos del tecnico que entrega la pieza');
    campo(doc, M, y, 90, 'Nombre completo del tecnico');
    campo(doc, M + 98, y, 88, 'Celular de contacto');
    y += 13;
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('SUPERINTENDENCIA (MARCAR UNA)', M, y);
    y = opciones(doc, M, y + 5, SUPERINTENDENCIAS.filter(Boolean), { columnas: 3, salto: 5.5 }) + 3;

    y = seccion(doc, y, 6, 'Entrega');
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('COORDINADOR QUE RECIBE', M, y);
    y = opciones(doc, M, y + 5, COORDINADORES_LISTA, { columnas: 5 }) + 3;
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('AREA DE ENTREGA', M, y);
    y = opciones(doc, M, y + 5, AREAS_ENTREGA, { columnas: 3, salto: 5.5 }) + 3;
    doc.setFont('helvetica', 'italic').setFontSize(6).setTextColor(...SUAVE);
    doc.text('Si hay fotos de la pieza, adjuntarlas impresas o enviarlas al coordinador al transcribir la solicitud.', M, y, { maxWidth: ANCHO });
    y += 8;

    y = seccion(doc, y, 7, 'Firmas', 'Sin firma del tecnico el formato no se recibe');
    doc.setDrawColor(...LINEA).setLineWidth(0.3).roundedRect(M, y, ANCHO, 40, 2, 2);
    const mitad = ANCHO / 2;
    doc.setDrawColor(...TINTA).setLineWidth(0.4);
    doc.line(M + 8, y + 27, M + mitad - 8, y + 27);
    doc.line(M + mitad + 8, y + 27, M + ANCHO - 8, y + 27);
    doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...TINTA);
    doc.text('FIRMA DEL TECNICO SOLICITANTE', M + 8, y + 31.5);
    doc.text('FIRMA DEL COORDINADOR QUE RECIBE', M + mitad + 8, y + 31.5);
    doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(...SUAVE);
    doc.text('Nombre y cedula:', M + 8, y + 35.5);
    doc.text('Fecha y hora de recibo:', M + mitad + 8, y + 35.5);
    y += 46;

    y = seccion(doc, y, 8, 'Para uso del coordinador', 'No lo diligencia el tecnico');
    campo(doc, M, y, 60, 'N.o de solicitud en la app');
    campo(doc, M + 66, y, 60, 'Transcrito por');
    campo(doc, M + 132, y, 54, 'Fecha de transcripcion');
    y += 13;
    doc.setFont('helvetica', 'bold').setFontSize(6.2).setTextColor(...SUAVE);
    doc.text('OBSERVACIONES  (trabajos que no se pueden ejecutar y por que)', M, y);
    renglones(doc, M, y + 6, ANCHO, 3);

    pie(doc, 2, 2);

    return doc;
};

/** Descarga el formato en blanco listo para imprimir. */
export const descargarFormatoPDF = () => {
    const doc = generarFormatoPDF();
    doc.save('MMHH-FR-01_Registro_de_requerimiento.pdf');
};
