/* ============================================================
   ECUADOR ENVEJECE
   p5.js + ml5.js + p5.sound

   REPRESENTACIÓN:

   100 BOLITAS = 100% DE LA POBLACIÓN

   1990 → 4%  → 4 bolitas amarillas
   2010 → 6.2% → 6 bolitas amarillas
   2022 → 9% → 9 bolitas amarillas
   2050 → 17% → 17 bolitas amarillas

   Las bolitas grises representan el 100%
   de la población de cada año.

   Las bolitas amarillas representan
   el porcentaje de población de 65 años
   o más.

   GESTOS:

   ✊ → 1990
   ✌ → 2010
   🤟 → 2022
   🖐 → 2050

   SONIDO:

   MICRÓFONO
       ↓
   VOLUMEN
       ↓
   ENERGÍA
       ↓
   MOVIMIENTO
       ↓
   IMPACTO
============================================================ */


/* ============================================================
   VARIABLES GENERALES
============================================================ */

let video;

let handPose;

let hands = [];

let mic;

let amplitude;

let canvas;


/* ============================================================
   DATOS
============================================================ */

let years = [

    {
        year: "1990",

        percentage: 4,

        population: 10200000,

        olderPopulation: 408000,

        populationText: "10,2 millones",

        x: 0.17,

        gestureEmoji: "✊"
    },

    {
        year: "2010",

        percentage: 6.2,

        population: 14900000,

        olderPopulation: 923800,

        populationText: "14,9 millones",

        x: 0.39,

        gestureEmoji: "✌"
    },

    {
        year: "2022",

        percentage: 9,

        population: 17700000,

        olderPopulation: 1593000,

        populationText: "17,7 millones",

        x: 0.61,

        gestureEmoji: "🤟"
    },

    {
        year: "2050",

        percentage: 17,

        population: 21100000,

        olderPopulation: 3587000,

        populationText: "21,1 millones",

        x: 0.83,

        gestureEmoji: "🖐"
    }

];


/* ============================================================
   ESTADO
============================================================ */

let active = false;

let paused = false;

let activeYearIndex = -1;

let gestureName = "";

let globalProgress = 0;


/* ============================================================
   MODELO
============================================================ */

let modelReady = false;

let cameraReady = false;


/* ============================================================
   AUDIO
============================================================ */

let soundLevel = 0;

let volumen = 0;

let energia = 0;

let energiaSuave = 0;

let fuerzaImpacto = 0;

let cooldownImpacto = 0;


/*
   Sensibilidad del micrófono.
*/

let sensibilidad = 0.15;


/*
   Umbral para detectar sonidos fuertes.
*/

let umbralImpacto = 0.55;


/* ============================================================
   REPRESENTACIÓN

   MUY IMPORTANTE:

   100 BOLITAS = 100%

   NO 220.
   NO 220 HABITANTES.
   NO 4 DE 220.

   Cada bolita equivale visualmente
   a 1 punto porcentual.
============================================================ */

let TOTAL_DOTS = 100;


/* ============================================================
   DISTRIBUCIÓN DEL FONDO

   Las 100 bolitas estarán distribuidas
   por TODO el fondo.

   No estarán encerradas dentro de círculos.
============================================================ */

let backgroundDots = [];


/* ============================================================
   DEBUG
============================================================ */

let DEBUG_GESTURES = false;


/* ============================================================
   COLORES
============================================================ */

let BG_COLOR = [
    10,
    13,
    23
];

let LIGHT_ON = [
    255,
    205,
    92
];

let LIGHT_ON_CORE = [
    255,
    236,
    190
];

let DOT_OFF = [
    90,
    90,
    110
];

let TEXT_COLOR = [
    243,
    241,
    233
];


/* ============================================================
   SETUP
============================================================ */

function setup() {

    canvas = createCanvas(
        windowWidth,
        windowHeight
    );

    canvas.parent(
        "canvas-container"
    );

    pixelDensity(1);


    /* ========================================================
       CÁMARA
    ======================================================== */

    video = createCapture({

        video: {

            width: 640,

            height: 480,

            facingMode: "user"

        },

        audio: false

    });


    video.size(
        640,
        480
    );


    video.elt.setAttribute(
        "playsinline",
        ""
    );


    video.elt.style.transform =
        "scaleX(-1)";


    video.elt.addEventListener(
        "loadeddata",
        function () {

            cameraReady = true;

        }
    );


    video.elt.addEventListener(
        "error",
        function () {

            cameraReady = false;

        }
    );


    video.hide();


    /* ========================================================
       MODELO DE MANOS
    ======================================================== */

    handPose = ml5.handPose(

        {

            flipped: true,

            maxHands: 1

        },

        modelLoaded

    );


    /* ========================================================
       MICRÓFONO
    ======================================================== */

    mic = new p5.AudioIn();


    mic.start(

        function () {

            console.log(
                "Micrófono listo"
            );

        },

        function () {

            console.log(
                "No se pudo acceder al micrófono"
            );

        }

    );


    amplitude =
        new p5.Amplitude();


    amplitude.setInput(
        mic
    );


    /* ========================================================
       CREAR LAS 100 BOLITAS
       DEL FONDO
    ======================================================== */

    buildBackgroundDots();

}


/* ============================================================
   ACTIVAR AUDIO
============================================================ */

function mousePressed() {

    userStartAudio();

}


function touchStarted() {

    userStartAudio();

}


/* ============================================================
   MODELO LISTO
============================================================ */

function modelLoaded() {

    modelReady = true;


    handPose.detectStart(
        video,
        gotHands
    );


    console.log(
        "Modelo de manos listo."
    );

}


/* ============================================================
   RESULTADOS DE MANOS
============================================================ */

function gotHands(results) {

    hands = results;

}


/* ============================================================
   CREAR LAS 100 BOLITAS DEL FONDO
============================================================ */

function buildBackgroundDots() {

    backgroundDots = [];


    for (
        let i = 0;

        i < TOTAL_DOTS;

        i++
    ) {


        /*
           Margen para evitar que las bolitas
           queden pegadas a los bordes.
        */

        let x =
            random(
                width * 0.025,
                width * 0.975
            );


        let y =
            random(
                height * 0.12,
                height * 0.94
            );


        backgroundDots.push({

            x: x,

            y: y,

            baseX: x,

            baseY: y,

            size:
                random(2.5, 5),

            phase:
                random(TWO_PI),

            speed:
                random(0.01, 0.025),

            noiseSeedX:
                random(1000),

            noiseSeedY:
                random(1000),

            currentX: x,

            currentY: y

        });

    }

}


/* ============================================================
   DRAW
============================================================ */

function draw() {


    background(
        BG_COLOR[0],
        BG_COLOR[1],
        BG_COLOR[2]
    );


    /* ========================================================
       AUDIO
    ======================================================== */

    updateSound();


    detectarImpacto();


    /* ========================================================
       GESTOS
    ======================================================== */

    detectGesture();


    /* ========================================================
       PROGRESO
    ======================================================== */

    updateProgress();


    /* ========================================================
       100 BOLITAS
       EN TODO EL FONDO
    ======================================================== */

    drawBackgroundPopulation();


    /* ========================================================
       INFORMACIÓN DE CADA AÑO
    ======================================================== */

    drawYearInformation();


    /* ========================================================
       ESTADO
    ======================================================== */

    drawStatus();

}


/* ============================================================
   AUDIO
============================================================ */

function updateSound() {

    if (!amplitude) {

        volumen = 0;

        energia = 0;

        return;

    }


    try {

        volumen =
            amplitude.getLevel();


        energia = map(

            volumen,

            0,

            sensibilidad,

            0,

            1

        );


        energia = constrain(

            energia,

            0,

            1

        );


        energiaSuave = lerp(

            energiaSuave,

            energia,

            0.20

        );


        soundLevel = lerp(

            soundLevel,

            energiaSuave,

            0.25

        );

    }

    catch (error) {

        volumen = 0;

        energia = 0;

        soundLevel = 0;

    }

}


/* ============================================================
   IMPACTO SONORO
============================================================ */

function detectarImpacto() {


    fuerzaImpacto *= 0.90;


    if (
        cooldownImpacto > 0
    ) {

        cooldownImpacto--;

    }


    if (

        energia >

        umbralImpacto

        &&

        cooldownImpacto === 0

    ) {

        fuerzaImpacto = 1;

        cooldownImpacto = 25;

    }

}


/* ============================================================
   DETECCIÓN DE GESTOS
============================================================ */

function detectGesture() {


    if (

        !hands ||

        hands.length === 0

    ) {

        active = false;

        paused = true;

        activeYearIndex = -1;

        return;

    }


    let hand =
        hands[0];


    let keypoints =
        hand.keypoints;


    if (

        !keypoints ||

        keypoints.length < 21

    ) {

        active = false;

        paused = true;

        activeYearIndex = -1;

        return;

    }


    let wrist =
        keypoints[0];


    let fingerTips = [
        8,
        12,
        16,
        20
    ];


    let fingerMCPs = [
        5,
        9,
        13,
        17
    ];


    let extended = [
        false,
        false,
        false,
        false,
        false
    ];


    /* ========================================================
       DEDOS
    ======================================================== */

    for (

        let i = 0;

        i < fingerTips.length;

        i++

    ) {

        let tip =
            keypoints[
                fingerTips[i]
            ];


        let mcp =
            keypoints[
                fingerMCPs[i]
            ];


        let tipDistance =
            dist(

                tip.x,
                tip.y,

                wrist.x,
                wrist.y

            );


        let mcpDistance =
            dist(

                mcp.x,
                mcp.y,

                wrist.x,
                wrist.y

            );


        extended[i + 1] =
            tipDistance >
            mcpDistance * 1.08;

    }


    /* ========================================================
       PULGAR
    ======================================================== */

    let thumbTip =
        keypoints[4];


    let indexMCP =
        keypoints[5];


    let handScale =
        dist(

            wrist.x,
            wrist.y,

            indexMCP.x,
            indexMCP.y

        );


    let thumbSpread =
        dist(

            thumbTip.x,
            thumbTip.y,

            indexMCP.x,
            indexMCP.y

        );


    extended[0] =
        thumbSpread >
        handScale * 0.75;


    /* ========================================================
       DEBUG
    ======================================================== */

    if (DEBUG_GESTURES) {

        console.log(
            "Dedos:",
            extended
        );

    }


    /* ========================================================
       PATRONES
    ======================================================== */

    let patterns = [

        {
            year: 0,

            gesture: "MANO ✊",

            shape: [
                false,
                false,
                false,
                false,
                false
            ]
        },


        {
            year: 1,

            gesture: "MANO ✌",

            shape: [
                false,
                true,
                true,
                false,
                false
            ]
        },


        {
            year: 2,

            gesture: "MANO 🤟",

            shape: [
                true,
                true,
                false,
                false,
                true
            ]
        },


        {
            year: 3,

            gesture: "MANO ABIERTA",

            shape: [
                true,
                true,
                true,
                true,
                true
            ]
        }

    ];


    /* ========================================================
       BUSCAR COINCIDENCIA
    ======================================================== */

    let bestScore = -1;

    let bestMatch = null;


    for (
        let p of patterns
    ) {

        let score = 0;


        for (
            let i = 0;

            i < 5;

            i++
        ) {

            if (

                extended[i] ===
                p.shape[i]

            ) {

                score++;

            }

        }


        if (
            score > bestScore
        ) {

            bestScore =
                score;

            bestMatch =
                p;

        }

    }


    let detectedYear = -1;

    let detectedGesture = "";


    if (

        bestMatch &&

        bestScore >= 4

    ) {

        detectedYear =
            bestMatch.year;

        detectedGesture =
            bestMatch.gesture;

    }


    /* ========================================================
       SIN GESTO
    ======================================================== */

    if (
        detectedYear === -1
    ) {

        active = false;

        paused = true;

        activeYearIndex = -1;

        gestureName =
            "GESTO NO RECONOCIDO";

        return;

    }


    /* ========================================================
       CAMBIO DE AÑO
    ======================================================== */

    if (

        activeYearIndex !==
        detectedYear

    ) {

        globalProgress = 0;

        activeYearIndex =
            detectedYear;

    }


    active = true;

    paused = false;

    gestureName =
        detectedGesture;

}


/* ============================================================
   PROGRESO
============================================================ */

function updateProgress() {


    if (

        active &&

        !paused

    ) {

        globalProgress +=
            0.025;


        globalProgress =
            constrain(

                globalProgress,

                0,

                1

            );

    }

}


/* ============================================================
   DIBUJAR LAS 100 BOLITAS

   AQUÍ ESTÁ EL CAMBIO PRINCIPAL.

   Ya NO existe una nube/círculo
   independiente para cada año.

   Las 100 bolitas ocupan TODO EL FONDO.

   Cuando se activa un año,
   solamente el porcentaje correspondiente
   cambia a amarillo.

   Ejemplo:

   1990:
   100 bolitas totales
   4 amarillas
   96 grises

   2010:
   100 totales
   6 amarillas
   94 grises

   2022:
   100 totales
   9 amarillas
   91 grises

   2050:
   100 totales
   17 amarillas
   83 grises
============================================================ */

function drawBackgroundPopulation() {


    let activeData = null;


    if (

        active &&

        !paused &&

        activeYearIndex >= 0

    ) {

        activeData =
            years[
                activeYearIndex
            ];

    }


    /* ========================================================
       CALCULAR CUÁNTAS BOLITAS AMARILLAS
    ======================================================== */

    let litCount = 0;


    if (activeData) {

        litCount =
            round(
                activeData.percentage
            );

    }

    let litAssigned = 0;

    let headerElement =
        document.querySelector(
            ".header"
        );

    let headerBounds =
        headerElement
            ? headerElement.getBoundingClientRect()
            : null;


    /* ========================================================
       CREAR ORDEN VISUAL

       El orden cambia una sola vez
       cuando se construyen las bolitas.

       Por eso no necesitamos recalcularlo
       constantemente.
    ======================================================== */

    for (

        let i = 0;

        i < backgroundDots.length;

        i++

    ) {

        let dot =
            backgroundDots[i];


        /*
           Las primeras X bolitas
           serán las amarillas.

           X = porcentaje.

           4% = 4 bolitas.
           6.2% ≈ 6 bolitas.
           9% = 9 bolitas.
           17% = 17 bolitas.
        */

        let isOverHeaderText =
            headerBounds &&
            dot.baseX >= headerBounds.left &&
            dot.baseX <= headerBounds.right &&
            dot.baseY >= headerBounds.top &&
            dot.baseY <= headerBounds.bottom;

        let shouldLight =
            activeData &&
            !isOverHeaderText &&
            litAssigned < litCount;

        if (shouldLight) {
            litAssigned++;
        }


        /* ====================================================
           MOVIMIENTO NATURAL
        ==================================================== */

        let nx =
            noise(
                dot.noiseSeedX,
                frameCount * 0.008
            ) - 0.5;


        let ny =
            noise(
                dot.noiseSeedY,
                frameCount * 0.008
            ) - 0.5;


        let idleX =
            sin(
                frameCount *
                dot.speed +
                dot.phase
            ) * 2;


        let idleY =
            cos(
                frameCount *
                dot.speed * 0.8 +
                dot.phase
            ) * 2;


        /*
           El sonido mueve las bolitas.
        */

        let soundAmount =
            soundLevel * 25;


        let soundX =
            nx * soundAmount;


        let soundY =
            ny * soundAmount;


        /* ====================================================
           IMPACTO RADIAL

           El impacto hace que las bolitas
           se separen ligeramente.
        ==================================================== */

        let centerX =
            width / 2;


        let centerY =
            height / 2;


        let dx =
            dot.baseX -
            centerX;


        let dy =
            dot.baseY -
            centerY;


        let distance =
            sqrt(
                dx * dx +
                dy * dy
            );


        let dirX = 0;

        let dirY = 0;


        if (distance > 0.001) {

            dirX =
                dx / distance;

            dirY =
                dy / distance;

        }


        let impactAmount =
            fuerzaImpacto * 30;


        let impactX =
            dirX *
            impactAmount;


        let impactY =
            dirY *
            impactAmount;


        /* ====================================================
           POSICIÓN FINAL
        ==================================================== */

        let targetX =
            dot.baseX +
            idleX +
            soundX +
            impactX;


        let targetY =
            dot.baseY +
            idleY +
            soundY +
            impactY;


        dot.currentX =
            lerp(
                dot.currentX,
                targetX,
                0.08
            );


        dot.currentY =
            lerp(
                dot.currentY,
                targetY,
                0.08
            );


        /* ====================================================
           BASE: 100 PUNTOS GRISES
        ==================================================== */

        fill(

            DOT_OFF[0],

            DOT_OFF[1],

            DOT_OFF[2],

            125

        );


        circle(

            dot.currentX,

            dot.currentY,

            dot.size

        );


        if (!shouldLight) {
            continue;
        }


        /* ====================================================
           ACTIVACIÓN PROGRESIVA

           Cuando se detecta la mano,
           las amarillas aparecen
           progresivamente.
        ==================================================== */

        let activation =
            max(
                globalProgress,
                0.15
            );


        /* ====================================================
           PULSO
        ==================================================== */

        let pulse =
            1 +

            sin(
                frameCount *
                dot.speed *
                2 +
                dot.phase
            ) * 0.18 +

            soundLevel * 0.8 +

            fuerzaImpacto * 0.3;


        let size =
            dot.size *
            2.2 *
            pulse;


        /* ====================================================
           GLOW EXTERIOR
        ==================================================== */

        fill(

            LIGHT_ON[0],

            LIGHT_ON[1],

            LIGHT_ON[2],

            15 * activation

        );


        circle(

            dot.currentX,

            dot.currentY,

            size * (
                7 +
                soundLevel * 8
            )

        );


        /* ====================================================
           GLOW MEDIO
        ==================================================== */

        fill(

            LIGHT_ON[0],

            LIGHT_ON[1],

            LIGHT_ON[2],

            55 * activation

        );


        circle(

            dot.currentX,

            dot.currentY,

            size * (
                3.5 +
                soundLevel * 2
            )

        );


        /* ====================================================
           CUERPO AMARILLO
        ==================================================== */

        fill(

            LIGHT_ON[0],

            LIGHT_ON[1],

            LIGHT_ON[2],

            225 * activation

        );


        circle(

            dot.currentX,

            dot.currentY,

            size * 1.7

        );


        /* ====================================================
           CENTRO
        ==================================================== */

        fill(

            LIGHT_ON_CORE[0],

            LIGHT_ON_CORE[1],

            LIGHT_ON_CORE[2],

            255 * activation

        );


        circle(

            dot.currentX,

            dot.currentY,

            size

        );

    }

}


/* ============================================================
   INFORMACIÓN DE LOS 4 AÑOS

   Se mantienen los años abajo.

   Ya no dibujamos cuatro círculos de bolitas.
============================================================ */

function drawYearInformation() {


    for (

        let i = 0;

        i < years.length;

        i++

    ) {

        let data =
            years[i];


        let isActive =

            active &&

            !paused &&

            activeYearIndex === i;


        let centerX =
            width *
            data.x;


        /*
           Información en la zona inferior.
        */

        let baseY =
            height *
            0.79;


        /* ====================================================
           PORCENTAJE
        ==================================================== */

        textAlign(
            CENTER,
            CENTER
        );


        textStyle(
            NORMAL
        );


        fill(

            isActive
                ? LIGHT_ON[0]
                : TEXT_COLOR[0],

            isActive
                ? LIGHT_ON[1]
                : TEXT_COLOR[1],

            isActive
                ? LIGHT_ON[2]
                : TEXT_COLOR[2],

            isActive
                ? 255
                : 170

        );

        textFont(
            "Dela Gothic One"
        );


        textSize(

            min(
                width,
                height
            ) * 0.045

        );


        text(

            data.percentage +
            "%",

            centerX,

            baseY

        );


        /* ====================================================
           AÑO
        ==================================================== */

        textFont(
            "Barlow Condensed"
        );

        textStyle(
            BOLD
        );


        fill(

            TEXT_COLOR[0],

            TEXT_COLOR[1],

            TEXT_COLOR[2],

            isActive
                ? 240
                : 155

        );


        textSize(

            max(
                16,
                min(
                    width,
                    height
                ) * 0.019
            )

        );


        text(

            data.year,

            centerX,

            baseY +
            min(
                width,
                height
            ) * 0.045

        );


        /* ====================================================
           GESTO PARA ACTIVAR
        ==================================================== */

        textStyle(
            NORMAL
        );

        fill(
            255,
            255,
            255,
            isActive
                ? 255
                : 190
        );

        textFont(
            "Arial"
        );

        textSize(

            min(
                width,
                height
            ) * 0.030

        );

        text(

            data.gestureEmoji,

            centerX,

            baseY +
            min(
                width,
                height
            ) * 0.080

        );


        textStyle(
            NORMAL
        );

    }

}


/* ============================================================
   ESTADO
============================================================ */

function drawStatus() {


    let message = "";


    if (!modelReady) {

        message =
            "CARGANDO CÁMARA...";

    }

    else if (!cameraReady) {

        message =
            "ACTIVA LA CÁMARA";

    }

    else if (
        !hands ||
        hands.length === 0
    ) {

        message =
            "MUESTRA TU MANO";

    }

    else if (paused) {

        message =
            "MUESTRA TU MANO";

    }

    else if (active) {

        let activeYear =
            years[
                activeYearIndex
            ];


        message =

            activeYear.year +

            " · " +

            activeYear.percentage +

            "%";

    }


    fill(

        TEXT_COLOR[0],

        TEXT_COLOR[1],

        TEXT_COLOR[2],

        90

    );


    noStroke();


    textAlign(
        RIGHT,
        CENTER
    );


    textSize(9);


    text(

        message,

        width -
        4.5 *
        width /
        100,

        25

    );

}


/* ============================================================
   RESIZE
============================================================ */

function windowResized() {


    resizeCanvas(

        windowWidth,

        windowHeight

    );


    /*
       Volvemos a distribuir las 100 bolitas
       para que ocupen correctamente
       el nuevo tamaño de pantalla.
    */

    buildBackgroundDots();

}