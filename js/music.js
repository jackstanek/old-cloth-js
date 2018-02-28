var renderer, scene, camera, light;
var string_inst, light;

var prev_time = 0;

const DT = 8;

const MIC_POS = new THREE.Vector3(0, 0, 0);

var context, sound_buf, buf_data, st;

function maximizeRendererSize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onresize = maximizeRendererSize;

window.onload = function() {
    document.getElementById("playbutton")
        .addEventListener("click", function() {
            source.buffer = sound_buf;
            source.connect(context.destination);
            source.start()
        });

    context = new AudioContext();
    sound_buf = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    buf_data = sound_buf.getChannelData(0);
    source = context.createBufferSource();
    st = 0;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
                                         0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    maximizeRendererSize();
    renderer.domElement.id = "rendering-output";
    document.body.appendChild(renderer.domElement);

    light = new THREE.DirectionalLight();
    light.position.set(0, 2, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    camera.position.z = 10;

    string_inst = new MusicalString(0.1, 1400, 0.2, 10, 10, 0.6);
    string_inst.initScene(scene);
    string_inst.pluck();

    setInterval(musicUpdate, DT);
}

function musicUpdate() {
    string_inst.updatePhysics(DT / 1000);
    buf_data[st++] = 0.5 * string_inst.nodes[5].vel.ol.y / 75;
    renderer.render(scene, camera);
}
