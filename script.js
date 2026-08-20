const datos = BSC_DATA;

const mesSelect = document.getElementById("mes");
const agenteSelect = document.getElementById("agente");

const metas = datos.metas;

function porcentaje(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) {
        return "—";
    }

    return (valor * 100).toFixed(1) + "%";
}

function cumple(valor, meta) {
    return valor !== null &&
           valor !== undefined &&
           valor >= meta;
}


// ===============================
// CARGAR MESES
// ===============================

datos.meses.forEach(mes => {

    const opcion = document.createElement("option");

    opcion.value = mes.key;
    opcion.textContent = mes.nombre;

    mesSelect.appendChild(opcion);
});


// ===============================
// CARGAR AGENTES
// ===============================

datos.agentes.forEach(agente => {

    const opcion = document.createElement("option");

    opcion.value = agente;
    opcion.textContent = agente;

    agenteSelect.appendChild(opcion);
});


// ===============================
// ACTUALIZACIÓN
// ===============================

document.getElementById("actualizacion").textContent =
    "Última actualización: " +
    new Date(datos.actualizado).toLocaleString("es-CO");


// ===============================
// FILTRAR DATOS
// ===============================

function obtenerDatos() {

    const mes = mesSelect.value;
    const agente = agenteSelect.value;

    return datos.datos.filter(registro => {

        const coincideMes =
            mes === "todos" ||
            registro.mes_key === mes;

        const coincideAgente =
            agente === "todos" ||
            registro.agente === agente;

        return coincideMes && coincideAgente;
    });
}


// ===============================
// ESTADO DE INDICADOR
// ===============================

function mostrarIndicador(valor, meta) {

    if (valor === null || valor === undefined) {
        return `<span>—</span>`;
    }

    const clase = cumple(valor, meta)
        ? "cumple"
        : "critico";

    return `
        <span class="${clase}">
            ${porcentaje(valor)}
        </span>
    `;
}


// ===============================
// ACTUALIZAR DASHBOARD
// ===============================

function actualizarDashboard() {

    const registros = obtenerDatos();
    const ficha = document.getElementById("fichaAgente");

if (agenteSelect.value !== "todos") {

    mostrarFichaAgente(registros[0]);

    ficha.style.display = "block";

} else {

    ficha.style.display = "none";
}

    const criticos = registros.filter(
        r => r.incumplimientos.length > 0
    );

    const reincidentes = registros.filter(
        r => r.reincidente === true
    );

    const cumplimiento = registros.filter(
        r =>
            r.incumplimientos.length === 0 &&
            r.estado === "Cumple"
    );


    // ===========================
    // TARJETAS
    // ===========================

    document.getElementById("totalCriticos").textContent =
        criticos.length;

    document.getElementById("totalReincidentes").textContent =
        reincidentes.length;

    document.getElementById("totalCumplimiento").textContent =
        cumplimiento.length;

    document.getElementById("totalAgentes").textContent =
        registros.length;


    // ===========================
    // TABLA CRÍTICOS
    // ===========================

    const tablaCriticos =
        document.getElementById("tablaCriticos");

    tablaCriticos.innerHTML = "";

    criticos.forEach(r => {

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>
                <strong>${r.agente}</strong>
            </td>

            <td>
                ${mostrarIndicador(
                    r.ECUF,
                    metas.ECUF
                )}
            </td>

            <td>
                ${mostrarIndicador(
                    r.ECN,
                    metas.ECN
                )}
            </td>

            <td>
                ${mostrarIndicador(
                    r.Encuesta,
                    metas.Encuesta
                )}
            </td>

            <td>
                ${mostrarIndicador(
                    r.Formacion,
                    metas.Formacion
                )}
            </td>

            <td>
                ${mostrarIndicador(
                    r.Tipificacion,
                    metas.Tipificacion
                )}
            </td>

            <td class="critico">
                ${r.incumplimientos.join(", ")}
            </td>
        `;

        tablaCriticos.appendChild(fila);
    });


    if (criticos.length === 0) {

        tablaCriticos.innerHTML = `
            <tr>
                <td colspan="7">
                    No hay agentes críticos.
                </td>
            </tr>
        `;
    }


    // ===========================
    // TABLA REINCIDENTES
    // ===========================

    const tablaReincidentes =
        document.getElementById(
            "tablaReincidentes"
        );

    tablaReincidentes.innerHTML = "";

    reincidentes.forEach(r => {

        r.reincidencias.forEach(reincidencia => {

            const fila =
                document.createElement("tr");

            fila.innerHTML = `

                <td>
                    <strong>${r.agente}</strong>
                </td>

                <td>
                    ${reincidencia.indicador}
                </td>

                <td>
                    ${reincidencia.periodos}
                </td>

                <td class="critico">
                    ${porcentaje(
                        reincidencia.resultado_actual
                    )}
                </td>
            `;

            tablaReincidentes.appendChild(fila);

        });

    });


    if (reincidentes.length === 0) {

        tablaReincidentes.innerHTML = `
            <tr>
                <td colspan="4">
                    No hay agentes reincidentes.
                </td>
            </tr>
        `;
    }


    // ===========================
    // PROMEDIOS
    // ===========================

    calcularPromedio(
        registros,
        "ECUF",
        "ecuf"
    );

    calcularPromedio(
        registros,
        "ECN",
        "ecn"
    );

    calcularPromedio(
        registros,
        "Encuesta",
        "encuesta"
    );

    calcularPromedio(
        registros,
        "Formacion",
        "formacion"
    );

    calcularPromedio(
        registros,
        "Tipificacion",
        "tipificacion"
    );
}


// ===============================
// PROMEDIO
// ===============================

function calcularPromedio(
    registros,
    campo,
    elemento
) {

    const valores = registros
        .map(r => r[campo])
        .filter(v =>
            v !== null &&
            v !== undefined &&
            !isNaN(v)
        );

    if (valores.length === 0) {

        document.getElementById(
            elemento
        ).textContent = "—";

        return;
    }

    const promedio =
        valores.reduce(
            (a, b) => a + b,
            0
        ) / valores.length;

    document.getElementById(
        elemento
    ).textContent =
        porcentaje(promedio);
}

function mostrarFichaAgente(r) {

    if (!r) return;

    document.getElementById("nombreAgente").textContent =
        r.agente;

    document.getElementById("periodoAgente").textContent =
        r.mes;

    const estado = document.getElementById("estadoAgente");

    if (r.incumplimientos.length > 0) {

        estado.textContent = "🔴 CRÍTICO";
        estado.className = "estado critico";

    } else {

        estado.textContent = "🟢 CUMPLE";
        estado.className = "estado cumple";
    }


    colocarFichaIndicador(
        "fichaECUF",
        r.ECUF,
        metas.ECUF
    );

    colocarFichaIndicador(
        "fichaECN",
        r.ECN,
        metas.ECN
    );

    colocarFichaIndicador(
        "fichaEncuesta",
        r.Encuesta,
        metas.Encuesta
    );

    colocarFichaIndicador(
        "fichaFormacion",
        r.Formacion,
        metas.Formacion
    );

    colocarFichaIndicador(
        "fichaTipificacion",
        r.Tipificacion,
        metas.Tipificacion
    );


    const detalle =
        document.getElementById("detalleEstado");


    if (r.incumplimientos.length > 0) {

        detalle.innerHTML =
            `<strong>Indicadores por debajo de la meta:</strong>
             ${r.incumplimientos.join(", ")}`;

    } else {

        detalle.innerHTML =
            `<strong>Resultado:</strong>
             El agente cumple con todos los indicadores disponibles.`;
    }


    if (r.reincidente) {

        detalle.innerHTML +=
            `<br><br>
             <strong>⚠ Reincidencia:</strong>
             ${r.reincidencias
                .map(x =>
                    `${x.indicador} (${x.periodos} períodos)`
                )
                .join(" · ")}`;
    }
}


function colocarFichaIndicador(
    id,
    valor,
    meta
) {

    const elemento =
        document.getElementById(id);

    elemento.textContent =
        porcentaje(valor);

    elemento.parentElement.classList.remove(
        "cumple",
        "critico"
    );

    if (
        valor !== null &&
        valor !== undefined
    ) {

        if (valor >= meta) {

            elemento.parentElement.classList.add(
                "cumple"
            );

        } else {

            elemento.parentElement.classList.add(
                "critico"
            );
        }
    }
}
// ===============================
// EVENTOS
// ===============================

mesSelect.addEventListener(
    "change",
    actualizarDashboard
);

agenteSelect.addEventListener(
    "change",
    actualizarDashboard
);


// ===============================
// INICIO
// ===============================

actualizarDashboard();