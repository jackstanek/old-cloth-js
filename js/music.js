var renderer, scene, camera, light;
var string_inst, light;

var prev_time = 0;

function maximizeRendererSize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onresize = maximizeRendererSize;

window.onload = function() {
    context = new AudioContext();

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

    string_inst = new MusicalString(0.1, 1400, 0.2, 30, 10, 0.94);
    string_inst.initScene(scene);

    setInterval(function() {renderer.render(scene, camera);}, 25);
}
